import { ROLES } from '@dgp/shared';
import { parsePagination } from '../../utils/pagination.js';
import { Meeting } from './meeting.model.js';
import { getNextSequence } from '../complaints/counter.model.js';
import { AppError } from '../../utils/app-error.js';
import { uploadAttachment, deleteAsset } from '../../utils/upload.js';
import { writeAudit } from '../audit/audit.service.js';

/** A meeting is "Live" for this long after it starts, unless an end time was given. */
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

function buildMeetingNumber(year, seq) {
  return `GS-${year}-${String(seq).padStart(4, '0')}`;
}

/**
 * Status is computed, never stored. A stored status is only correct until the moment it should
 * have changed — a meeting would still read "Upcoming" a week after it was held, because
 * nothing runs at 11am on a Sunday to move it on.
 */
export function statusOf(meeting, now = new Date()) {
  const start = new Date(meeting.scheduledAt);
  const end = meeting.endsAt
    ? new Date(meeting.endsAt)
    : new Date(start.getTime() + DEFAULT_DURATION_MS);
  if (now < start) return 'Upcoming';
  if (now <= end) return 'Live';
  return 'Completed';
}

function shape(doc, now) {
  const row = doc.toJSON ? doc.toJSON() : { ...doc, id: String(doc._id), _id: undefined };
  return { ...row, status: statusOf(row, now) };
}

async function audit(officerId, action, meeting) {
  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action,
    entity: 'meetings',
    entityId: meeting.id ?? String(meeting._id),
    after: { title: meeting.title },
  });
}

/**
 * Citizen list. Published meetings only. Upcoming and live ones come first in ascending order
 * (the next one is the one that matters); completed ones follow, newest first.
 */
export async function publicList(query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const now = new Date();
  const filter = { isActive: true, isPublished: true };
  if (query.meetingType) filter.meetingType = query.meetingType;

  const [rows, total] = await Promise.all([
    Meeting.find(filter).sort({ scheduledAt: -1 }).skip(skip).limit(limit).lean(),
    Meeting.countDocuments(filter),
  ]);

  const shaped = rows.map((r) => shape(r, now));
  const rank = { Live: 0, Upcoming: 1, Completed: 2 };
  shaped.sort((a, b) => {
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
    // Within upcoming: soonest first. Within completed: most recent first.
    const dir = a.status === 'Completed' ? -1 : 1;
    return dir * (new Date(a.scheduledAt) - new Date(b.scheduledAt));
  });

  return { data: shaped, page, limit, total };
}

export async function publicDetail(id) {
  const meeting = await Meeting.findOne({ _id: id, isActive: true, isPublished: true })
    .lean()
    .catch(() => null);
  if (!meeting) throw new AppError(404, 'MEETING_NOT_FOUND', 'Meeting not found');
  return shape(meeting, new Date());
}

/** Officer list — includes unpublished drafts. */
export async function adminList(query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const now = new Date();
  const filter = { isActive: true };
  if (query.meetingType) filter.meetingType = query.meetingType;

  const [rows, total] = await Promise.all([
    Meeting.find(filter).sort({ scheduledAt: -1 }).skip(skip).limit(limit).lean(),
    Meeting.countDocuments(filter),
  ]);
  return { data: rows.map((r) => shape(r, now)), page, limit, total };
}

export async function adminDetail(id) {
  const meeting = await Meeting.findOne({ _id: id, isActive: true })
    .lean()
    .catch(() => null);
  if (!meeting) throw new AppError(404, 'MEETING_NOT_FOUND', 'Meeting not found');
  return shape(meeting, new Date());
}

/**
 * Agenda arrives as JSON from a multipart form, so it may be a string. Malformed JSON is the
 * client's mistake, not ours — it must read as 400, not as an unhandled 500.
 */
function parseAgenda(value) {
  if (!value) return [];
  let raw = value;
  if (typeof value === 'string') {
    try {
      raw = JSON.parse(value);
    } catch {
      throw new AppError(400, 'INVALID_AGENDA', 'Agenda must be a valid JSON array');
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && String(item.title || '').trim())
    .map((item) => ({ title: String(item.title).trim(), description: item.description || '' }));
}

export async function createMeeting(officerId, body, files = {}) {
  const year = new Date().getFullYear();
  const seq = await getNextSequence(`meeting-${year}`);

  const notice = files.notice?.[0];
  const banner = files.banner?.[0];

  const meeting = await Meeting.create({
    meetingNumber: buildMeetingNumber(year, seq),
    title: body.title,
    description: body.description || '',
    meetingType: body.meetingType || 'GramSabha',
    scheduledAt: body.scheduledAt,
    endsAt: body.endsAt || undefined,
    venue: body.venue || '',
    agenda: parseAgenda(body.agenda),
    noticeUrl: notice ? (await uploadAttachment(notice, 'meetings')).url : undefined,
    noticeName: notice?.originalname,
    bannerUrl: banner ? (await uploadAttachment(banner, 'meetings')).url : undefined,
    isPublished: body.isPublished === true || body.isPublished === 'true',
    createdBy: officerId,
  });

  await audit(officerId, 'meeting.create', meeting);
  return shape(meeting, new Date());
}

export async function updateMeeting(id, officerId, body, files = {}) {
  const meeting = await Meeting.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!meeting) throw new AppError(404, 'MEETING_NOT_FOUND', 'Meeting not found');

  for (const key of ['title', 'description', 'meetingType', 'scheduledAt', 'endsAt', 'venue']) {
    if (body[key] !== undefined) meeting[key] = body[key] || undefined;
  }
  if (body.agenda !== undefined) meeting.agenda = parseAgenda(body.agenda);
  if (body.isPublished !== undefined) {
    meeting.isPublished = body.isPublished === true || body.isPublished === 'true';
  }

  const notice = files.notice?.[0];
  if (notice) {
    const prev = meeting.noticeUrl;
    const uploaded = await uploadAttachment(notice, 'meetings');
    meeting.noticeUrl = uploaded.url;
    meeting.noticeName = notice.originalname;
    await deleteAsset(prev);
  }
  const banner = files.banner?.[0];
  if (banner) {
    const prev = meeting.bannerUrl;
    meeting.bannerUrl = (await uploadAttachment(banner, 'meetings')).url;
    await deleteAsset(prev);
  }
  const minutes = files.minutes?.[0];
  if (minutes) {
    const prev = meeting.minutesUrl;
    meeting.minutesUrl = (await uploadAttachment(minutes, 'meetings')).url;
    await deleteAsset(prev);
  }

  await meeting.save();
  await audit(officerId, 'meeting.update', meeting);
  return shape(meeting, new Date());
}

export async function deleteMeeting(id, officerId) {
  const meeting = await Meeting.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!meeting) throw new AppError(404, 'MEETING_NOT_FOUND', 'Meeting not found');
  meeting.isActive = false;
  await meeting.save();
  await audit(officerId, 'meeting.delete', meeting);
  return { id: meeting.id };
}
