import { ROLES, PAGINATION_DEFAULTS } from '@dgp/shared';
import { Scheme } from './scheme.model.js';
import { getNextSequence } from '../complaints/counter.model.js';
import { AppError } from '../../utils/app-error.js';
import { uploadAttachment } from '../../utils/upload.js';
import { writeAudit } from '../audit/audit.service.js';

function buildSchemeId(year, seq) {
  return `SCH-${year}-${String(seq).padStart(6, '0')}`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function audit(officerId, action, scheme, before, after) {
  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action,
    entity: 'schemes',
    entityId: scheme.id,
    before,
    after,
  });
}

/** requiredDocuments may arrive as an array or newline/comma string (multipart). */
function normalizeDocs(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[\n,]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

/** @param {{ officerId: string, body: object, file?: object }} params */
export async function createScheme({ officerId, body, file }) {
  const year = new Date().getFullYear();
  const seq = await getNextSequence(`scheme-${year}`);

  const image = file ? await uploadAttachment(file, 'schemes') : null;
  const published = body.isPublished === true || body.isPublished === 'true';

  const scheme = await Scheme.create({
    schemeId: buildSchemeId(year, seq),
    title: body.title,
    summary: body.summary || undefined,
    description: body.description,
    category: body.category || 'Other',
    eligibility: body.eligibility || undefined,
    requiredDocuments: normalizeDocs(body.requiredDocuments),
    benefits: body.benefits || undefined,
    applicationProcess: body.applicationProcess || undefined,
    officialWebsite: body.officialWebsite || undefined,
    imageUrl: image?.url,
    publishDate: published ? body.publishDate || new Date() : body.publishDate || undefined,
    expiryDate: body.expiryDate || undefined,
    isPublished: published,
    createdBy: officerId,
  });

  await audit(officerId, 'scheme.create', scheme, null, { schemeId: scheme.schemeId });
  return scheme.toJSON();
}

/** @param {string} id @param {string} officerId @param {object} body @param {object} [file] */
export async function updateScheme(id, officerId, body, file) {
  const scheme = await Scheme.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!scheme) throw new AppError(404, 'SCHEME_NOT_FOUND', 'Scheme not found');

  const before = { title: scheme.title, category: scheme.category };
  const textFields = [
    'title',
    'summary',
    'description',
    'category',
    'eligibility',
    'benefits',
    'applicationProcess',
    'officialWebsite',
    'publishDate',
    'expiryDate',
  ];
  for (const key of textFields) {
    if (body[key] !== undefined) scheme[key] = body[key] || undefined;
  }
  if (body.requiredDocuments !== undefined) {
    scheme.requiredDocuments = normalizeDocs(body.requiredDocuments);
  }
  if (file) {
    const image = await uploadAttachment(file, 'schemes');
    scheme.imageUrl = image.url;
  }

  await scheme.save();
  await audit(officerId, 'scheme.update', scheme, before, { title: scheme.title });
  return scheme.toJSON();
}

async function setPublished(id, officerId, isPublished, action) {
  const scheme = await Scheme.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!scheme) throw new AppError(404, 'SCHEME_NOT_FOUND', 'Scheme not found');
  scheme.isPublished = isPublished;
  if (isPublished && !scheme.publishDate) scheme.publishDate = new Date();
  await scheme.save();
  await audit(officerId, action, scheme, null, { isPublished });
  return scheme.toJSON();
}

export const publishScheme = (id, officerId) => setPublished(id, officerId, true, 'scheme.publish');
export const unpublishScheme = (id, officerId) =>
  setPublished(id, officerId, false, 'scheme.unpublish');

/** Soft delete. */
export async function deleteScheme(id, officerId) {
  const scheme = await Scheme.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!scheme) throw new AppError(404, 'SCHEME_NOT_FOUND', 'Scheme not found');
  scheme.isActive = false;
  await scheme.save();
  await audit(officerId, 'scheme.delete', scheme, null, { isActive: false });
  return { id: scheme.id };
}

function buildSearch(filter, query) {
  if (query.category) filter.category = query.category;
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [{ schemeId: rx }, { title: rx }, { summary: rx }, { description: rx }];
  }
}

async function paginate(filter, query) {
  const page = query.page || PAGINATION_DEFAULTS.page;
  const limit = query.limit || PAGINATION_DEFAULTS.limit;
  const sortField = ['createdAt', 'title', 'category'].includes(query.sortBy)
    ? query.sortBy
    : 'createdAt';
  const sortDir = query.sortDir === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    Scheme.find(filter)
      .sort({ [sortField]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit),
    Scheme.countDocuments(filter),
  ]);
  return { data: items.map((s) => s.toJSON()), total, page, limit };
}

/** Officer list — all active schemes (published + drafts). */
export async function adminList(query) {
  const filter = { isActive: true };
  buildSearch(filter, query);
  return paginate(filter, query);
}

/** @param {string} id */
export async function adminGetOne(id) {
  const scheme = await Scheme.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!scheme) throw new AppError(404, 'SCHEME_NOT_FOUND', 'Scheme not found');
  return scheme.toJSON();
}

/** Public list — only published, active, unexpired. */
export async function publicList(query) {
  const now = new Date();
  const filter = {
    isActive: true,
    isPublished: true,
    $and: [
      {
        $or: [
          { expiryDate: null },
          { expiryDate: { $exists: false } },
          { expiryDate: { $gte: now } },
        ],
      },
    ],
  };
  buildSearch(filter, query);
  return paginate(filter, query);
}

/** @param {string} id */
export async function publicDetail(id) {
  const now = new Date();
  const scheme = await Scheme.findOne({
    _id: id,
    isActive: true,
    isPublished: true,
    $or: [{ expiryDate: null }, { expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }],
  }).catch(() => null);
  if (!scheme) throw new AppError(404, 'SCHEME_NOT_FOUND', 'Scheme not found');
  return scheme.toJSON();
}
