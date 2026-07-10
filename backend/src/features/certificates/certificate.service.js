import { ROLES, PAGINATION_DEFAULTS, CERT_TYPE_FIELDS } from '@dgp/shared';
import { CertificateApplication } from './certificate.model.js';
import { generateCertificatePdf } from './pdf.service.js';
import { getNextSequence } from '../complaints/counter.model.js';
import { User } from '../auth/user.model.js';
import { AppError } from '../../utils/app-error.js';
import { uploadAttachments, uploadPdfBuffer } from '../../utils/upload.js';
import { writeAudit } from '../audit/audit.service.js';
import { notifyDakhalaStatus } from '../notifications/notification.service.js';

function buildApplicationId(year, seq) {
  return `DKH-${year}-${String(seq).padStart(6, '0')}`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Dynamic per-type required-field validation (single source: CERT_TYPE_FIELDS). */
function validateApplicationData(type, data) {
  const fields = CERT_TYPE_FIELDS[type] || [];
  const missing = {};
  for (const field of fields) {
    if (!field.required) continue;
    const value = data?.[field.key];
    if (value === undefined || value === null || String(value).trim() === '') {
      missing[field.key] = `${field.label} is required`;
    }
  }
  if (Object.keys(missing).length > 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Missing required fields', missing);
  }
}

function parseApplicationData(raw) {
  if (raw && typeof raw === 'object') return raw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      return JSON.parse(raw);
    } catch {
      throw new AppError(400, 'VALIDATION_ERROR', 'applicationData must be valid JSON', {
        applicationData: 'Invalid JSON',
      });
    }
  }
  return {};
}

async function audit(actorId, actorRole, action, app, before, after) {
  await writeAudit({
    actorId,
    actorRole,
    action,
    entity: 'dakhalaapplications',
    entityId: app.id,
    before,
    after,
  });
}

/** @param {{ citizenId: string, body: object, files?: Array }} params */
export async function apply({ citizenId, body, files }) {
  const certificateType = body.certificateType;
  if (!CERT_TYPE_FIELDS[certificateType]) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid certificate type', {
      certificateType: 'Unknown type',
    });
  }
  const applicationData = parseApplicationData(body.applicationData);
  validateApplicationData(certificateType, applicationData);

  const uploadedDocuments = await uploadAttachments(files, 'certificates/docs');

  const year = new Date().getFullYear();
  const seq = await getNextSequence(`dakhala-${year}`);

  const app = await CertificateApplication.create({
    applicationId: buildApplicationId(year, seq),
    citizenId,
    certificateType,
    applicationData,
    uploadedDocuments,
    status: 'Submitted',
    history: [{ status: 'Submitted', by: citizenId, at: new Date() }],
    createdBy: citizenId,
  });

  await audit(citizenId, ROLES.CITIZEN, 'dakhala.apply', app, null, {
    applicationId: app.applicationId,
    certificateType,
  });
  return app.toJSON();
}

/** @param {string} citizenId @param {object} query */
export async function listMine(citizenId, query) {
  const page = query.page || PAGINATION_DEFAULTS.page;
  const limit = query.limit || PAGINATION_DEFAULTS.limit;
  const filter = { citizenId, isActive: true };
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    CertificateApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    CertificateApplication.countDocuments(filter),
  ]);
  return { data: items.map((a) => a.toJSON()), total, page, limit };
}

async function findActive(id) {
  const app = await CertificateApplication.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!app) throw new AppError(404, 'APPLICATION_NOT_FOUND', 'Application not found');
  return app;
}

/** @param {string} id @param {{ id: string, role: string }} user */
export async function getOne(id, user) {
  const app = await findActive(id);
  const isOwner = String(app.citizenId) === String(user.id);
  if (user.role !== ROLES.OFFICER && !isOwner) {
    throw new AppError(403, 'FORBIDDEN', 'You cannot access this application');
  }
  return app.toJSON();
}

/** Access-controlled certificate URL — owner or officer, and only when Approved. */
export async function getCertificate(id, user) {
  const app = await findActive(id);
  const isOwner = String(app.citizenId) === String(user.id);
  if (user.role !== ROLES.OFFICER && !isOwner) {
    throw new AppError(403, 'FORBIDDEN', 'You cannot access this certificate');
  }
  if (app.status !== 'Approved' || !app.pdfUrl) {
    throw new AppError(404, 'CERTIFICATE_NOT_READY', 'Certificate is not available yet');
  }
  return { applicationId: app.applicationId, pdfUrl: app.pdfUrl };
}

/** @param {object} query */
export async function adminList(query) {
  const page = query.page || PAGINATION_DEFAULTS.page;
  const limit = query.limit || PAGINATION_DEFAULTS.limit;
  const filter = { isActive: true };
  if (query.status) filter.status = query.status;
  if (query.certificateType) filter.certificateType = query.certificateType;
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [{ applicationId: rx }];
  }

  const [items, total] = await Promise.all([
    CertificateApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    CertificateApplication.countDocuments(filter),
  ]);
  return { data: items.map((a) => a.toJSON()), total, page, limit };
}

/** @param {string} id */
export async function adminGetOne(id) {
  const app = await findActive(id);
  return app.toJSON();
}

/** Move to UnderReview. @param {string} id @param {string} officerId */
export async function review(id, officerId) {
  const app = await findActive(id);
  if (app.status === 'Submitted') {
    app.status = 'UnderReview';
    app.reviewedBy = officerId;
    app.updatedBy = officerId;
    app.history.push({ status: 'UnderReview', by: officerId, at: new Date() });
    await app.save();
    await audit(
      officerId,
      ROLES.OFFICER,
      'dakhala.review',
      app,
      { status: 'Submitted' },
      { status: 'UnderReview' },
    );
  }
  return app.toJSON();
}

/**
 * Approve: generate the PDF certificate, store it, mark Approved, notify + audit.
 * @param {string} id @param {string} officerId
 */
export async function approve(id, officerId) {
  const app = await findActive(id);
  if (app.status === 'Approved') {
    // Idempotent — already approved.
    return app.toJSON();
  }
  if (app.status === 'Rejected') {
    throw new AppError(409, 'ALREADY_REJECTED', 'A rejected application cannot be approved');
  }

  const [citizen, officer] = await Promise.all([
    User.findById(app.citizenId).select('fullName mobile village'),
    User.findById(officerId).select('fullName'),
  ]);

  const pdfBuffer = await generateCertificatePdf({ application: app.toJSON(), citizen, officer });
  const pdfUrl = await uploadPdfBuffer(pdfBuffer, 'certificates/pdf');

  const before = { status: app.status };
  app.status = 'Approved';
  app.pdfUrl = pdfUrl;
  app.reviewedBy = officerId;
  app.updatedBy = officerId;
  app.rejectionReason = undefined;
  app.history.push({ status: 'Approved', by: officerId, at: new Date() });
  await app.save();

  await audit(officerId, ROLES.OFFICER, 'dakhala.approve', app, before, { status: 'Approved' });
  await notifyDakhalaStatus({
    mobile: citizen?.mobile,
    applicationId: app.applicationId,
    status: 'Approved',
    entityId: app.id,
  });

  return app.toJSON();
}

/**
 * Reject with a mandatory reason, notify + audit.
 * @param {string} id @param {string} officerId @param {string} reason
 */
export async function reject(id, officerId, reason) {
  if (!reason || !reason.trim()) {
    throw new AppError(400, 'VALIDATION_ERROR', 'A rejection reason is required', {
      reason: 'Reason is required',
    });
  }
  const app = await findActive(id);
  if (app.status === 'Approved') {
    throw new AppError(409, 'ALREADY_APPROVED', 'An approved application cannot be rejected');
  }

  const before = { status: app.status };
  app.status = 'Rejected';
  app.rejectionReason = reason.trim();
  app.reviewedBy = officerId;
  app.updatedBy = officerId;
  app.history.push({ status: 'Rejected', by: officerId, note: reason.trim(), at: new Date() });
  await app.save();

  await audit(officerId, ROLES.OFFICER, 'dakhala.reject', app, before, {
    status: 'Rejected',
    reason: reason.trim(),
  });

  const citizen = await User.findById(app.citizenId).select('mobile');
  await notifyDakhalaStatus({
    mobile: citizen?.mobile,
    applicationId: app.applicationId,
    status: 'Rejected',
    reason: reason.trim(),
    entityId: app.id,
  });

  return app.toJSON();
}

/** Internal soft delete. @param {string} id @param {string} officerId */
export async function softDelete(id, officerId) {
  const app = await findActive(id);
  app.isActive = false;
  app.updatedBy = officerId;
  await app.save();
  await audit(officerId, ROLES.OFFICER, 'dakhala.delete', app, null, { isActive: false });
  return { id: app.id };
}
