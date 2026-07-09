import { ROLES, PAGINATION_DEFAULTS } from '@dgp/shared';
import { TaxRecord } from './tax.model.js';
import { getNextSequence } from '../complaints/counter.model.js';
import { User } from '../auth/user.model.js';
import { AppError } from '../../utils/app-error.js';
import { writeAudit } from '../audit/audit.service.js';

function buildTaxRecordId(year, seq) {
  return `TAX-${year}-${String(seq).padStart(6, '0')}`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Derive balance + status from amount/amountPaid. */
function recompute(record) {
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

/** @param {{ officerId: string, body: object }} params */
export async function createRecord({ officerId, body }) {
  const citizen = await User.findOne({ _id: body.citizenId, role: ROLES.CITIZEN }).catch(
    () => null,
  );
  if (!citizen) throw new AppError(404, 'CITIZEN_NOT_FOUND', 'Citizen not found');

  const year = new Date().getFullYear();
  const seq = await getNextSequence(`tax-${year}`);
  const amount = Number(body.amount);

  const record = await TaxRecord.create({
    taxRecordId: buildTaxRecordId(year, seq),
    citizenId: body.citizenId,
    propertyNumber: body.propertyNumber,
    taxType: body.taxType,
    financialYear: body.financialYear,
    amount,
    amountPaid: 0,
    balance: amount,
    paymentStatus: amount > 0 ? 'Unpaid' : 'Paid',
    dueDate: body.dueDate || undefined,
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
  if (amount > record.balance) {
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
  return record.toJSON();
}

/** @param {string} id */
export async function getHistory(id) {
  const record = await TaxRecord.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!record) throw new AppError(404, 'TAX_NOT_FOUND', 'Tax record not found');
  const json = record.toJSON();
  return { history: json.history, payments: json.payments };
}

function buildFilter(query) {
  const filter = { isActive: true };
  if (query.taxType) filter.taxType = query.taxType;
  if (query.financialYear) filter.financialYear = query.financialYear;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.citizenId) filter.citizenId = query.citizenId;
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [{ taxRecordId: rx }, { propertyNumber: rx }];
  }
  return filter;
}

async function paginate(filter, query) {
  const page = query.page || PAGINATION_DEFAULTS.page;
  const limit = query.limit || PAGINATION_DEFAULTS.limit;
  const [items, total] = await Promise.all([
    TaxRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    TaxRecord.countDocuments(filter),
  ]);
  return { data: items.map((r) => r.toJSON()), total, page, limit };
}

export async function adminList(query) {
  return paginate(buildFilter(query), query);
}

/** @param {string} id */
export async function adminGetOne(id) {
  const record = await TaxRecord.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!record) throw new AppError(404, 'TAX_NOT_FOUND', 'Tax record not found');
  return record.toJSON();
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
