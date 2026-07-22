import { ROLES, PAGINATION_DEFAULTS } from '@dgp/shared';
import { Event } from './event.model.js';
import { AppError } from '../../utils/app-error.js';
import { uploadAttachment, deleteAsset } from '../../utils/upload.js';
import { writeAudit } from '../audit/audit.service.js';

async function audit(officerId, action, event) {
  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action,
    entity: 'events',
    entityId: event.id,
    after: { title: event.title },
  });
}

/** Public list — upcoming/ongoing events (endDate, or startDate, still in the future). */
export async function publicUpcoming(limit = 10) {
  const now = new Date();
  const events = await Event.find({
    isActive: true,
    $or: [{ endDate: { $gte: now } }, { endDate: null, startDate: { $gte: now } }],
  })
    .sort({ startDate: 1 })
    .limit(limit)
    .lean();
  return events.map((e) => ({ ...e, id: String(e._id), _id: undefined }));
}

/** Officer list — every active event, newest first, paginated. */
export async function adminList(query = {}) {
  const page = Math.max(1, Number(query.page) || PAGINATION_DEFAULTS.page);
  const limit = Math.min(
    PAGINATION_DEFAULTS.maxLimit,
    Math.max(1, Number(query.limit) || PAGINATION_DEFAULTS.limit),
  );
  const filter = { isActive: true };
  const [rows, total] = await Promise.all([
    Event.find(filter)
      .sort({ startDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Event.countDocuments(filter),
  ]);
  return {
    data: rows.map((e) => ({ ...e, id: String(e._id), _id: undefined })),
    page,
    limit,
    total,
  };
}

export async function createEvent(officerId, body, file) {
  const banner = file ? (await uploadAttachment(file, 'events')).url : undefined;
  const event = await Event.create({
    title: body.title,
    description: body.description || '',
    banner,
    startDate: body.startDate,
    endDate: body.endDate || undefined,
    location: body.location || '',
    organizer: body.organizer || '',
    category: body.category || 'Other',
    createdBy: officerId,
  });
  await audit(officerId, 'event.create', event);
  return event.toJSON();
}

export async function updateEvent(id, officerId, body, file) {
  const event = await Event.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');

  for (const key of [
    'title',
    'description',
    'startDate',
    'endDate',
    'location',
    'organizer',
    'category',
  ]) {
    if (body[key] !== undefined) event[key] = body[key] || undefined;
  }
  if (file) {
    const prev = event.banner;
    event.banner = (await uploadAttachment(file, 'events')).url;
    await deleteAsset(prev);
  }
  await event.save();
  await audit(officerId, 'event.update', event);
  return event.toJSON();
}

export async function deleteEvent(id, officerId) {
  const event = await Event.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
  event.isActive = false;
  await event.save();
  await audit(officerId, 'event.delete', event);
  return { id: event.id };
}
