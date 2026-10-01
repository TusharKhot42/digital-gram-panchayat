import { ROLES } from '@dgp/shared';
import { parsePagination } from '../../utils/pagination.js';
import { TaxRecord } from './tax.model.js';
import { getNextSequence } from '../complaints/counter.model.js';
import { User } from '../auth/user.model.js';
import { AppError } from '../../utils/app-error.js';
import { uploadAttachments } from '../../utils/upload.js';
import { writeAudit } from '../audit/audit.service.js';
import { notifyTaxUpdate } from '../notifications/notification.service.js';

function buildTaxRecordId(year, seq) {
  return `TAX-${year}-${String(seq).padStart(6, '0')}`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Derive balance + status from amount/amountPaid.
 *
 * `amount` is null when the officer raised the record from a scanned bill without transcribing
 * the figure. An unknown total is not a zero total: it can never settle to Paid, because nothing
 * knows what settling would mean. Balance stays 0 so the village dues figure never counts a
 * number it does not have.
 */
function recompute(record) {
  if (record.amount === null || record.amount === undefined) {
    record.balance = 0;
    record.paymentStatus = record.amountPaid > 0 ? 'Partial' : 'Unpaid';
    return;
  }
  record.balance = Math.max(0, record.amount - record.amountPaid);
  if (record.amountPaid <= 0) record.paymentStatus = 'Unpaid';
  else if (record.amountPaid >= record.amount) record.paymentStatus = 'Paid';
  else record.paymentStatus = 'Partial';
}

async function audit(officerId, action, record, before, after) {
  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action,
    entity: 'taxrecords',
    entityId: record.id,
    before,
    after,
  });
}

/**
 * Tax-scoped citizen lookup by mobile or name so an officer can attach a record to the right
 * person. Returns the matched citizen and all search results if multiple.
 * @param {string|object} input
 */
export async function lookupCitizen(input) {
  let search = '';
  if (typeof input === 'string') {
    search = input.trim();
  } else if (input && typeof input === 'object') {
    search = (input.q || input.mobile || input.name || '').trim();
  }

  if (!search) {
    throw new AppError(400, 'QUERY_REQUIRED', 'Please provide a name or mobile number to search');
  }

  const isDigits = /^\d+$/.test(search);
  let filter;

  if (isDigits && search.length === 10) {
    filter = { role: ROLES.CITIZEN, mobile: search };
  } else {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter = {
      role: ROLES.CITIZEN,
      $or: [{ fullName: rx }, { mobile: rx }],
    };
  }

  const citizens = await User.find(filter).select('fullName mobile village ward').limit(10).lean();

  if (!citizens.length) {
    throw new AppError(
      404,
      'CITIZEN_NOT_FOUND',
      'No citizen found matching this name or mobile number',
    );
  }

  const primary = citizens[0];
  const results = citizens.map((c) => ({
    id: String(c._id),
    fullName: c.fullName,
    mobile: c.mobile,
    village: c.village,
    ward: c.ward,
  }));

  return {
    id: String(primary._id),
    fullName: primary.fullName,
    mobile: primary.mobile,
    village: primary.village,
    ward: primary.ward,
    results,
    totalMatches: results.length,
  };
}

/** @param {{ officerId: string, body: object }} params */
export async function createRecord({ officerId, body, files }) {
  const citizen = await User.findOne({ _id: body.citizenId, role: ROLES.CITIZEN }).catch(
    () => null,
  );
  if (!citizen) throw new AppError(404, 'CITIZEN_NOT_FOUND', 'Citizen not found');

  const year = new Date().getFullYear();
  const seq = await getNextSequence(`tax-${year}`);
  // Omitted amount means "read it off the scanned bill", which is the normal path now that the
  // officer attaches the bill instead of transcribing the figure. Kept distinct from 0, which
  // means a genuine nil demand and settles the record.
  const hasAmount = body.amount !== undefined && body.amount !== null && body.amount !== '';
  const amount = hasAmount ? Number(body.amount) : null;

  // Reuse the shared upload abstraction (Cloudinary or mock) — no duplicate logic.
  const bills = await uploadAttachments(files, 'tax');
  if (!bills.length && !hasAmount) {
    throw new AppError(
      400,
      'BILL_REQUIRED',
      'Attach the scanned bill, or enter the assessed amount',
    );
  }

  const record = await TaxRecord.create({
    taxRecordId: buildTaxRecordId(year, seq),
    citizenId: body.citizenId,
    ward: body.ward || citizen.ward || undefined,
    propertyNumber: body.propertyNumber,
    taxType: body.taxType,
    financialYear: body.financialYear,
    amount,
    amountPaid: 0,
    balance: amount ?? 0,
    paymentStatus: amount === null || amount > 0 ? 'Unpaid' : 'Paid',
    dueDate: body.dueDate || undefined,
    bills,
    createdBy: officerId,
    history: [
      { action: 'create', field: 'amount', old: null, new: amount, by: officerId, at: new Date() },
    ],
  });

  await audit(officerId, 'tax.create', record, null, { taxRecordId: record.taxRecordId, amount });
  return record.toJSON();
}

/**
 * Update the record. Amount/propertyNumber/dueDate changes are appended to history —
 * previous values are preserved, never overwritten.
 * @param {string} id @param {string} officerId @param {object} body
 */
export async function updateRecord(id, officerId, body) {
  const record = await TaxRecord.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!record) throw new AppError(404, 'TAX_NOT_FOUND', 'Tax record not found');

  const before = { amount: record.amount, propertyNumber: record.propertyNumber };
  const at = new Date();

  if (body.amount !== undefined && Number(body.amount) !== record.amount) {
    const oldAmount = record.amount;
    record.amount = Number(body.amount);
    record.history.push({
      action: 'update',
      field: 'amount',
      old: oldAmount,
      new: record.amount,
      by: officerId,
      at,
    });
  }
  if (body.propertyNumber !== undefined && body.propertyNumber !== record.propertyNumber) {
    const oldPn = record.propertyNumber;
    record.propertyNumber = body.propertyNumber;
    record.history.push({
      action: 'update',
      field: 'propertyNumber',
      old: oldPn,
      new: record.propertyNumber,
      by: officerId,
      at,
    });
  }
  if (body.dueDate !== undefined) {
    record.dueDate = body.dueDate || undefined;
    record.history.push({
      action: 'update',
      field: 'dueDate',
      old: null,
      new: record.dueDate,
      by: officerId,
      at,
    });
  }

  record.updatedBy = officerId;
  recompute(record);
  await record.save();

  await audit(officerId, 'tax.update', record, before, { amount: record.amount });
  return record.toJSON();
}

/**
 * Record a payment: append to payments[] + history[], recompute totals. Rejects an
 * amount that exceeds the outstanding balance.
 * @param {string} id @param {string} officerId @param {object} payload
 */
export async function addPayment(id, officerId, payload) {
  const record = await TaxRecord.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!record) throw new AppError(404, 'TAX_NOT_FOUND', 'Tax record not found');

  const amount = Number(payload.amount);
  if (amount <= 0) throw new AppError(400, 'INVALID_PAYMENT', 'Payment must be greater than zero');
  // A record raised from a scanned bill has no assessed total, so there is no balance to exceed.
  // Refusing the receipt would be worse than accepting it: the citizen has paid either way.
  if (record.amount !== null && record.amount !== undefined && amount > record.balance) {
    throw new AppError(400, 'PAYMENT_EXCEEDS_BALANCE', 'Payment exceeds the outstanding balance');
  }

  const at = payload.paidAt ? new Date(payload.paidAt) : new Date();
  record.payments.push({
    amount,
    paidAt: at,
    receiptNo: payload.receiptNo || undefined,
    mode: payload.mode || undefined,
    receivedBy: officerId,
  });
  record.amountPaid += amount;
  record.history.push({
    action: 'payment',
    field: 'amountPaid',
    old: record.amountPaid - amount,
    new: record.amountPaid,
    by: officerId,
    at,
  });
  record.updatedBy = officerId;
  recompute(record);
  await record.save();

  await audit(officerId, 'tax.payment', record, null, { amount, amountPaid: record.amountPaid });

  // Notify the citizen a payment was recorded (in-app + SMS). Non-blocking.
  const citizen = await User.findById(record.citizenId).select('mobile');
  await notifyTaxUpdate({
    recipientId: record.citizenId,
    mobile: citizen?.mobile,
    taxRecordId: record.taxRecordId,
    message: `A payment of ₹${amount} was recorded for ${record.taxRecordId}. Balance: ₹${record.balance}.`,
    entityId: record.id,
  }).catch(() => {});

  return record.toJSON();
}

/** @param {string} id */
export async function getHistory(id) {
  const record = await TaxRecord.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!record) throw new AppError(404, 'TAX_NOT_FOUND', 'Tax record not found');
  const json = record.toJSON();
  return { history: json.history, payments: json.payments };
}

async function buildFilter(query) {
  const filter = { isActive: true };
  if (query.taxType) filter.taxType = query.taxType;
  if (query.financialYear) filter.financialYear = query.financialYear;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.citizenId) filter.citizenId = query.citizenId;
  if (query.ward) filter.ward = query.ward;
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    const matchedUsers = await User.find({
      role: ROLES.CITIZEN,
      $or: [{ fullName: rx }, { mobile: rx }],
    })
      .select('_id')
      .limit(50)
      .lean();
    const userIds = matchedUsers.map((u) => u._id);

    filter.$or = [
      { taxRecordId: rx },
      { propertyNumber: rx },
      ...(userIds.length > 0 ? [{ citizenId: { $in: userIds } }] : []),
    ];
  }
  return filter;
}

async function paginate(filter, query) {
  const { page, limit, skip } = parsePagination(query);
  const [items, total] = await Promise.all([
    TaxRecord.find(filter)
      .populate('citizenId', 'fullName mobile village ward')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    TaxRecord.countDocuments(filter),
  ]);
  return {
    data: items.map((r) => {
      const json = r.toJSON();
      if (r.citizenId && typeof r.citizenId === 'object') {
        json.citizen = {
          id: String(r.citizenId._id || r.citizenId.id),
          fullName: r.citizenId.fullName,
          mobile: r.citizenId.mobile,
          village: r.citizenId.village,
          ward: r.citizenId.ward,
        };
      }
      return json;
    }),
    total,
    page,
    limit,
  };
}

export async function adminList(query) {
  const filter = await buildFilter(query);
  return paginate(filter, query);
}

/** @param {string} id */
export async function adminGetOne(id) {
  const record = await TaxRecord.findOne({ _id: id, isActive: true })
    .populate('citizenId', 'fullName mobile village ward')
    .catch(() => null);
  if (!record) throw new AppError(404, 'TAX_NOT_FOUND', 'Tax record not found');
  const json = record.toJSON();
  if (record.citizenId && typeof record.citizenId === 'object') {
    json.citizen = {
      id: String(record.citizenId._id || record.citizenId.id),
      fullName: record.citizenId.fullName,
      mobile: record.citizenId.mobile,
      village: record.citizenId.village,
      ward: record.citizenId.ward,
    };
  }
  return json;
}

/**
 * Citizen's own records. Optional financialYear / taxType filter.
 * @param {string} citizenId @param {object} query
 */
export async function listMine(citizenId, query) {
  const filter = { citizenId, isActive: true };
  if (query.financialYear) filter.financialYear = query.financialYear;
  if (query.taxType) filter.taxType = query.taxType;

  const records = await TaxRecord.find(filter).sort({ financialYear: -1, taxType: 1 });
  const data = records.map((r) => r.toJSON());
  const totalDues = data.reduce((sum, r) => sum + r.balance, 0);
  return { data, totalDues };
}
