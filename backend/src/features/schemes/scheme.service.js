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

/**
 * A date-only expiry ("2026-08-01") parses to midnight UTC, and the citizen filter is
 * `expiryDate >= now` — so the scheme would vanish the moment its expiry DAY began.
 * Roll date-only values to the end of that day (same rule the notice module uses).
 */
function normalizeExpiry(value) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value; // let schema validation reject it
  if (
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0
  ) {
    d.setUTCHours(23, 59, 59, 999);
  }
  return d;
}

/** Multer `.fields()` output → { image?, attachments[] }, with `image` forced to be an image. */
function pickSchemeFiles(files) {
  const image = files?.image?.[0];
  if (image && !image.mimetype.startsWith('image/')) {
    throw new AppError(400, 'INVALID_FILE_TYPE', 'The banner must be an image');
  }
  return { image, extra: files?.attachments ?? [] };
}

async function uploadExtras(extra) {
  const out = [];
  for (const file of extra) {
    // Sequential on purpose: local disk store, tiny counts (≤5), keeps ordering stable.
    const up = await uploadAttachment(file, 'schemes');
    out.push({ url: up.url, type: up.type, name: file.originalname });
  }
  return out;
}

/** @param {{ officerId: string, body: object, files?: object }} params */
export async function createScheme({ officerId, body, files }) {
  const year = new Date().getFullYear();
  const seq = await getNextSequence(`scheme-${year}`);

  const { image: imageFile, extra } = pickSchemeFiles(files);
  const image = imageFile ? await uploadAttachment(imageFile, 'schemes') : null;
  const attachments = await uploadExtras(extra);
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
    attachments,
    publishDate: published ? body.publishDate || new Date() : body.publishDate || undefined,
    expiryDate: normalizeExpiry(body.expiryDate),
    isPublished: published,
    createdBy: officerId,
  });

  await audit(officerId, 'scheme.create', scheme, null, { schemeId: scheme.schemeId });
  return scheme.toJSON();
}

/**
 * In-place edit — the same document is saved, never a copy, so the schemeId and the
 * citizen-facing URL stay stable and no duplicate can appear in either portal.
 *
 * @param {string} id @param {string} officerId @param {object} body @param {object} [files]
 */
export async function updateScheme(id, officerId, body, files) {
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
  ];
  for (const key of textFields) {
    if (body[key] !== undefined) scheme[key] = body[key] || undefined;
  }
  if (body.expiryDate !== undefined) {
    scheme.expiryDate = normalizeExpiry(body.expiryDate);
  }
  if (body.requiredDocuments !== undefined) {
    scheme.requiredDocuments = normalizeDocs(body.requiredDocuments);
  }

  // The edit form's publish toggle must actually take effect (multipart sends strings).
  if (body.isPublished !== undefined) {
    const published = body.isPublished === true || body.isPublished === 'true';
    scheme.isPublished = published;
    if (published && !scheme.publishDate) scheme.publishDate = new Date();
  }

  // Banner image: replace when a new file arrives, clear when explicitly asked.
  const { image: imageFile, extra } = pickSchemeFiles(files);
  if (imageFile) {
    const image = await uploadAttachment(imageFile, 'schemes');
    scheme.imageUrl = image.url;
  } else if (body.removeImage === 'true' || body.removeImage === true) {
    scheme.imageUrl = undefined;
  }

  // Attachments: existing ones survive unless their URL is listed for removal; new
  // uploads append. (Officer-only route, so deletion here is admin-only by construction.)
  if (body.removeAttachments) {
    const remove = new Set(
      String(body.removeAttachments)
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean),
    );
    scheme.attachments = (scheme.attachments || []).filter((a) => !remove.has(a.url));
  }
  const added = await uploadExtras(extra);
  if (added.length) scheme.attachments = [...(scheme.attachments || []), ...added];

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
