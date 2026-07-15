import { ROLES, PAGINATION_DEFAULTS } from '@dgp/shared';
import { Notice } from './notice.model.js';
import { getNextSequence } from '../complaints/counter.model.js';
import { AppError } from '../../utils/app-error.js';
import { uploadAttachment } from '../../utils/upload.js';
import { translateFields } from '../translation/translation.service.js';
import { writeAudit } from '../audit/audit.service.js';
import { broadcastNotice } from '../notifications/notification.service.js';

function buildNoticeId(year, seq) {
  return `NTC-${year}-${String(seq).padStart(6, '0')}`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function audit(officerId, action, notice, before, after) {
  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action,
    entity: 'notices',
    entityId: notice.id,
    before,
    after,
  });
}

async function attach(file) {
  if (!file) return null;
  return uploadAttachment(file, 'notices');
}

/**
 * @param {{ officerId: string, body: object, file?: object }} params
 */
export async function createNotice({ officerId, body, file }) {
  const year = new Date().getFullYear();
  const seq = await getNextSequence(`notice-${year}`);

  const attachment = await attach(file);
  const published = body.isPublished === true || body.isPublished === 'true';

  // Auto-translate the human-authored fields into both languages (source auto-detected).
  const i18n = await translateFields(
    { title: body.title, summary: body.summary, content: body.content },
    body.lang,
  );

  const notice = await Notice.create({
    noticeId: buildNoticeId(year, seq),
    title: body.title,
    summary: body.summary || undefined,
    content: body.content,
    category: body.category || 'General',
    i18n,
    attachmentUrl: attachment?.url,
    attachmentType: attachment?.type,
    publishDate: published ? body.publishDate || new Date() : body.publishDate || undefined,
    expiryDate: body.expiryDate || undefined,
    isPublished: published,
    createdBy: officerId,
  });

  await audit(officerId, 'notice.create', notice, null, { noticeId: notice.noticeId });
  return notice.toJSON();
}

/**
 * @param {string} id
 * @param {string} officerId
 * @param {object} body
 * @param {object} [file]
 */
export async function updateNotice(id, officerId, body, file) {
  const notice = await Notice.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!notice) throw new AppError(404, 'NOTICE_NOT_FOUND', 'Notice not found');

  const before = { title: notice.title, category: notice.category };
  const fields = ['title', 'summary', 'content', 'category', 'publishDate', 'expiryDate'];
  for (const key of fields) {
    if (body[key] !== undefined) notice[key] = body[key] || undefined;
  }

  const attachment = await attach(file);
  if (attachment) {
    notice.attachmentUrl = attachment.url;
    notice.attachmentType = attachment.type;
  }

  // Refresh bilingual versions from the updated fields.
  notice.i18n = await translateFields(
    { title: notice.title, summary: notice.summary, content: notice.content },
    body.lang,
  );

  await notice.save();
  await audit(officerId, 'notice.update', notice, before, { title: notice.title });
  return notice.toJSON();
}

/** @param {string} id @param {string} officerId */
export async function publishNotice(id, officerId) {
  const notice = await Notice.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!notice) throw new AppError(404, 'NOTICE_NOT_FOUND', 'Notice not found');
  notice.isPublished = true;
  if (!notice.publishDate) notice.publishDate = new Date();
  await notice.save();
  await audit(officerId, 'notice.publish', notice, null, { isPublished: true });
  return notice.toJSON();
}

/** @param {string} id @param {string} officerId */
export async function archiveNotice(id, officerId) {
  const notice = await Notice.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!notice) throw new AppError(404, 'NOTICE_NOT_FOUND', 'Notice not found');
  notice.isPublished = false;
  await notice.save();
  await audit(officerId, 'notice.archive', notice, null, { isPublished: false });
  return notice.toJSON();
}

/** Soft delete. @param {string} id @param {string} officerId */
export async function deleteNotice(id, officerId) {
  const notice = await Notice.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!notice) throw new AppError(404, 'NOTICE_NOT_FOUND', 'Notice not found');
  notice.isActive = false;
  await notice.save();
  await audit(officerId, 'notice.delete', notice, null, { isActive: false });
  return { id: notice.id };
}

function buildSearch(filter, query) {
  if (query.category) filter.category = query.category;
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [{ noticeId: rx }, { title: rx }, { summary: rx }, { content: rx }];
  }
}

async function paginate(filter, query) {
  const page = query.page || PAGINATION_DEFAULTS.page;
  const limit = query.limit || PAGINATION_DEFAULTS.limit;
  const [items, total] = await Promise.all([
    Notice.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notice.countDocuments(filter),
  ]);
  return { data: items.map((n) => n.toJSON()), total, page, limit };
}

/** Officer list — all active notices (published + drafts). */
export async function adminList(query) {
  const filter = { isActive: true };
  buildSearch(filter, query);
  return paginate(filter, query);
}

/** @param {string} id */
export async function adminGetOne(id) {
  const notice = await Notice.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!notice) throw new AppError(404, 'NOTICE_NOT_FOUND', 'Notice not found');
  return notice.toJSON();
}

/** Public list — only published, active, unexpired. No auth. */
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
  const notice = await Notice.findOne({
    _id: id,
    isActive: true,
    isPublished: true,
    $or: [{ expiryDate: null }, { expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }],
  }).catch(() => null);
  if (!notice) throw new AppError(404, 'NOTICE_NOT_FOUND', 'Notice not found');
  return notice.toJSON();
}

/**
 * @param {string} id
 * @param {string} officerId
 * @param {{ sms?: boolean, voice?: boolean, summary: string }} payload
 */
export async function broadcast(id, officerId, payload) {
  const notice = await Notice.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!notice) throw new AppError(404, 'NOTICE_NOT_FOUND', 'Notice not found');

  const channels = { sms: Boolean(payload.sms), voice: Boolean(payload.voice) };
  const stats = await broadcastNotice({ notice, channels, summary: payload.summary });

  notice.broadcast = {
    sms: channels.sms,
    voice: channels.voice,
    summary: payload.summary,
    dispatchedAt: new Date(),
    recipientCount: stats.recipientCount,
    channels: [...(channels.sms ? ['sms'] : []), ...(channels.voice ? ['voice'] : [])],
  };
  await notice.save();

  await audit(officerId, 'notice.broadcast', notice, null, {
    recipientCount: stats.recipientCount,
    channels: notice.broadcast.channels,
  });

  return { notice: notice.toJSON(), ...stats };
}
