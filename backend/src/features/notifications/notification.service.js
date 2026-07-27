import {
  ROLES,
  NotificationPurpose,
  NotificationModule,
  NotificationType,
  NOTIFICATION_MAX_RETRIES,
} from '@dgp/shared';
import { parsePagination } from '../../utils/pagination.js';
import { randomUUID } from 'node:crypto';
import { Notification } from './notification.model.js';
import { getProvider } from './providers/index.js';
import { enqueue, setQueueHandler } from './notification.queue.js';
import { User } from '../auth/user.model.js';
import { AppError } from '../../utils/app-error.js';
import { writeAudit } from '../audit/audit.service.js';
import { translateFields } from '../translation/translation.service.js';
import { env } from '../../config/env.js';

// Collision-proof id (no shared counter) — a notification must never fail the caller.
function buildNotificationId() {
  return `NTF-${new Date().getFullYear()}-${randomUUID().slice(0, 12)}`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function audit(actorId, actorRole, action, notification, extra) {
  await writeAudit({
    actorId,
    actorRole,
    action,
    entity: 'notifications',
    entityId: notification.id,
    after: { status: notification.status, ...extra },
  });
}

/**
 * Deliver a queued notification through the provider abstraction. Registered as the
 * queue handler; also called directly by retry. Updates status + audits the outcome.
 * @param {{ notificationId: string }} job
 */
async function deliver({ notificationId }) {
  const n = await Notification.findById(notificationId);
  if (!n) return;

  const external = (n.channels || []).filter((c) => c !== 'inApp');
  if (external.length === 0) {
    n.status = 'sent'; // in-app only: stored = delivered to the centre
    n.deliveredAt = new Date();
    await n.save();
    await audit(null, 'system', 'notification.sent', n, { channel: 'inApp' });
    return;
  }

  let anySuccess = false;
  let anyFailure = false;
  const errors = [];
  let providerMessageId;

  for (const channel of external) {
    const provider = getProvider(channel);
    if (!provider || !n.to) {
      // no provider or no destination — skip this channel
      continue;
    }
    const result = await provider.send({
      to: n.to,
      title: n.title,
      message: n.message,
      metadata: n.metadata,
    });
    if (result.status === 'sent' || result.status === 'delivered') {
      anySuccess = true;
      providerMessageId = providerMessageId || result.providerMessageId;
    } else if (result.status === 'failed') {
      anyFailure = true;
      if (result.error) errors.push(`${channel}: ${result.error}`);
    }
  }

  if (anySuccess) {
    n.status = 'delivered';
    n.deliveredAt = new Date();
    n.providerMessageId = providerMessageId;
    n.error = undefined;
  } else if (anyFailure) {
    n.status = 'failed';
    n.error = errors.join('; ');
  } else {
    // all external channels skipped (not configured) — the in-app record still stands
    n.status = 'sent';
    n.deliveredAt = new Date();
  }
  await n.save();

  const action =
    n.status === 'failed'
      ? 'notification.failed'
      : n.status === 'delivered'
        ? 'notification.delivered'
        : 'notification.sent';
  await audit(null, 'system', action, n, { channels: external, error: n.error });
}

setQueueHandler(deliver);

/**
 * Create + queue a notification. Every module funnels through here.
 * @param {{ recipientId, recipientRole?, title, message, type?, module?, channels?, purpose?, entityId?, to?, metadata? }} input
 */
export async function notify(input) {
  const channels = input.channels && input.channels.length ? input.channels : ['inApp'];
  const external = channels.filter((c) => c !== 'inApp');

  const notification = await Notification.create({
    notificationId: buildNotificationId(),
    recipientId: input.recipientId,
    recipientRole: input.recipientRole || ROLES.CITIZEN,
    title: input.title,
    message: input.message,
    type: input.type || NotificationType.Info,
    module: input.module || NotificationModule.System,
    channel: external[0] || 'inApp',
    channels,
    purpose: input.purpose || NotificationPurpose.Broadcast,
    broadcastId: input.broadcastId,
    i18n: input.i18n,
    entityId: input.entityId,
    to: input.to,
    status: 'queued',
    metadata: input.metadata,
  });

  await audit(null, 'system', 'notification.created', notification, {
    module: notification.module,
    channels,
  });

  // Deterministic (awaited) delivery outside production so callers/tests see final status.
  await enqueue({ notificationId: notification.id }, { sync: env.NODE_ENV !== 'production' });

  return Notification.findById(notification.id).then((n) => n.toJSON());
}

/**
 * Broadcast to every active user of a role. Returns dispatch stats.
 * @param {{ officerId, title, message, type?, targetRole?, channels?, module? }} input
 */
export async function broadcast(input) {
  const targetRole = input.targetRole || ROLES.CITIZEN;
  const users = await User.find({ role: targetRole, isActive: true }).select('mobile').lean();
  const broadcastId = randomUUID(); // groups all per-recipient rows into one dashboard entry
  // Translate the officer-authored title/message once; every recipient row carries both.
  const i18n = await translateFields({ title: input.title, message: input.message }, input.lang);

  let count = 0;
  for (const user of users) {
    await notify({
      recipientId: user._id,
      recipientRole: targetRole,
      title: input.title,
      message: input.message,
      type: input.type,
      module: input.module || NotificationModule.System,
      channels: input.channels || ['inApp'],
      purpose: NotificationPurpose.Broadcast,
      broadcastId,
      i18n,
      to: user.mobile,
    });
    count += 1;
  }

  await writeAudit({
    actorId: input.officerId,
    actorRole: ROLES.OFFICER,
    action: 'notification.broadcast',
    entity: 'notifications',
    after: { recipientCount: count, channels: input.channels, broadcastId },
  });

  return { recipientCount: count, channels: input.channels || ['inApp'], broadcastId };
}

/** @param {string} id @param {string} userId */
export async function markRead(id, userId) {
  const n = await Notification.findById(id).catch(() => null);
  if (!n) throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
  if (String(n.recipientId) !== String(userId)) {
    throw new AppError(403, 'FORBIDDEN', 'Not your notification');
  }
  if (!n.readAt) {
    n.readAt = new Date();
    await n.save();
    await audit(userId, n.recipientRole, 'notification.read', n, {});
  }
  return n.toJSON();
}

/** Mark all of a user's notifications read. */
export async function markAllRead(userId) {
  const res = await Notification.updateMany(
    { recipientId: userId, readAt: null },
    { $set: { readAt: new Date() } },
  );
  return { updated: res.modifiedCount ?? 0 };
}

/** Retry a failed notification (officer). */
export async function retry(id, officerId) {
  const n = await Notification.findById(id).catch(() => null);
  if (!n) throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
  if (n.status !== 'failed') {
    throw new AppError(400, 'NOT_RETRYABLE', 'Only failed notifications can be retried');
  }
  if (n.retryCount >= NOTIFICATION_MAX_RETRIES) {
    throw new AppError(400, 'MAX_RETRIES', 'Maximum retry attempts reached');
  }
  n.retryCount += 1;
  n.status = 'queued';
  await n.save();
  await audit(officerId, ROLES.OFFICER, 'notification.retried', n, { retryCount: n.retryCount });

  await deliver({ notificationId: n.id });
  return Notification.findById(n.id).then((doc) => doc.toJSON());
}

// ---- Queries ----
export async function listMine(userId, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { recipientId: userId };
  if (query.unread === 'true') filter.readAt = null;
  if (query.module) filter.module = query.module;
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [{ title: rx }, { message: rx }];
  }

  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipientId: userId, readAt: null }),
  ]);
  return { data: items.map((n) => n.toJSON()), total, page, limit, unread };
}

export async function unreadCount(userId) {
  return Notification.countDocuments({ recipientId: userId, readAt: null });
}

export async function getMine(id, userId) {
  const n = await Notification.findById(id).catch(() => null);
  if (!n || String(n.recipientId) !== String(userId)) {
    throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
  }
  return n.toJSON();
}

export async function adminList(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.channel) filter.channel = query.channel;
  if (query.module) filter.module = query.module;
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [{ notificationId: rx }, { title: rx }, { message: rx }, { to: rx }];
  }

  const [items, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);
  return { data: items.map((n) => n.toJSON()), total, page, limit };
}

export async function adminGetOne(id) {
  const n = await Notification.findById(id).catch(() => null);
  if (!n) throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
  return n.toJSON();
}

export async function stats() {
  const [byStatus, byChannel, total] = await Promise.all([
    Notification.aggregate([
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $project: { _id: 0, label: '$_id', value: 1 } },
    ]),
    Notification.aggregate([
      { $group: { _id: '$channel', value: { $sum: 1 } } },
      { $project: { _id: 0, label: '$_id', value: 1 } },
    ]),
    Notification.countDocuments({}),
  ]);
  return { total, byStatus, byChannel };
}

/**
 * Admin dashboard: one row per broadcast (not per recipient). Rolls the per-recipient
 * notification documents up by `broadcastId` with delivery counts. Individual (non-broadcast)
 * notifications are excluded — the citizen notification centre is unaffected.
 */
export async function listBroadcasts(query = {}) {
  // Query params arrive as strings; $skip/$limit reject non-numbers outright.
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const [rows, ids] = await Promise.all([
    Notification.aggregate([
      { $match: { broadcastId: { $ne: null } } },
      {
        $group: {
          _id: '$broadcastId',
          title: { $first: '$title' },
          message: { $first: '$message' },
          module: { $first: '$module' },
          channels: { $first: '$channels' },
          createdAt: { $min: '$createdAt' },
          recipientCount: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $in: ['$status', ['sent', 'delivered']] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]),
    Notification.distinct('broadcastId', { broadcastId: { $ne: null } }),
  ]);

  const data = rows.map((r) => ({
    broadcastId: r._id,
    title: r.title,
    message: r.message,
    module: r.module,
    channels: r.channels,
    createdAt: r.createdAt,
    recipientCount: r.recipientCount,
    deliveredCount: r.delivered,
    failedCount: r.failed,
    status:
      r.failed > 0
        ? r.delivered > 0
          ? 'partial'
          : 'failed'
        : r.delivered >= r.recipientCount
          ? 'delivered'
          : 'queued',
  }));
  return { data, total: ids.length, page, limit };
}

/** Recipient-level breakdown for one broadcast (drill-in from the dashboard). */
export async function broadcastRecipients(broadcastId, query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const [items, total] = await Promise.all([
    Notification.find({ broadcastId })
      .populate('recipientId', 'fullName mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ broadcastId }),
  ]);
  if (!total) throw new AppError(404, 'BROADCAST_NOT_FOUND', 'Broadcast not found');

  const first = items[0];
  return {
    broadcast: {
      broadcastId,
      title: first?.title,
      message: first?.message,
      channels: first?.channels,
      createdAt: first?.createdAt,
    },
    recipients: items.map((n) => ({
      id: n.id,
      name: n.recipientId?.fullName,
      mobile: n.recipientId?.mobile || n.to,
      status: n.status,
      read: Boolean(n.readAt),
      deliveredAt: n.deliveredAt,
      error: n.error,
    })),
    total,
    page,
    limit,
  };
}

// ---- Backward-compatible module helpers (unchanged signatures for existing callers) ----

/** @param {{ recipientId?, mobile?, complaintId, status, entityId? }} params */
export async function notifyComplaintStatus({
  recipientId,
  mobile,
  complaintId,
  status,
  entityId,
}) {
  if (!recipientId) return { status: 'skipped' };
  return notify({
    recipientId,
    recipientRole: ROLES.CITIZEN,
    title: 'Complaint update',
    message: `Your complaint ${complaintId} is now "${status}".`,
    type: NotificationType.Info,
    module: NotificationModule.Complaint,
    channels: mobile ? ['inApp', 'sms'] : ['inApp'],
    purpose: NotificationPurpose.ComplaintUpdate,
    entityId,
    to: mobile,
  });
}

/** @param {{ recipientId?, mobile?, applicationId, status, reason?, entityId? }} params */
export async function notifyDakhalaStatus({
  recipientId,
  mobile,
  applicationId,
  status,
  reason,
  entityId,
}) {
  if (!recipientId) return { status: 'skipped' };
  const suffix = status === 'Rejected' && reason ? ` Reason: ${reason}` : '';
  return notify({
    recipientId,
    recipientRole: ROLES.CITIZEN,
    title: 'Certificate application update',
    message: `Your certificate application ${applicationId} is now "${status}".${suffix}`,
    type: status === 'Rejected' ? NotificationType.Warning : NotificationType.Success,
    module: NotificationModule.Certificate,
    channels: mobile ? ['inApp', 'sms'] : ['inApp'],
    purpose: NotificationPurpose.DakhalaUpdate,
    entityId,
    to: mobile,
  });
}

/** @param {{ recipientId?, mobile?, taxRecordId, message, entityId? }} params */
export async function notifyTaxUpdate({ recipientId, mobile, taxRecordId, message, entityId }) {
  if (!recipientId) return { status: 'skipped' };
  return notify({
    recipientId,
    recipientRole: ROLES.CITIZEN,
    title: 'Tax update',
    message: message || `Your tax record ${taxRecordId} was updated.`,
    type: NotificationType.Info,
    module: NotificationModule.Tax,
    channels: mobile ? ['inApp', 'sms'] : ['inApp'],
    purpose: NotificationPurpose.TaxUpdate,
    entityId,
    to: mobile,
  });
}

/** @param {{ recipientId, fullName? }} params */
export async function notifyWelcome({ recipientId, fullName }) {
  return notify({
    recipientId,
    recipientRole: ROLES.CITIZEN,
    title: 'Welcome to Digital Gram Panchayat',
    message: `Welcome${fullName ? `, ${fullName}` : ''}! You can now file complaints, read notices, and apply for certificates.`,
    type: NotificationType.Success,
    module: NotificationModule.Auth,
    channels: ['inApp'],
    purpose: NotificationPurpose.Welcome,
  });
}

/**
 * Notice broadcast — one notification per active citizen with the notice on the chosen
 * channel(s). Keeps prior stats shape (recipientCount, sms, voice) for the notice module.
 * @param {{ notice, channels: { sms?: boolean, voice?: boolean }, summary: string }} params
 */
export async function broadcastNotice({ notice, channels, summary }) {
  const citizens = await User.find({ role: ROLES.CITIZEN, isActive: true, mobile: { $ne: null } })
    .select('mobile')
    .lean();

  const noticeChannels = [
    'inApp',
    ...(channels.sms ? ['sms'] : []),
    ...(channels.voice ? ['voice'] : []),
  ];
  const broadcastId = randomUUID();
  const i18n = await translateFields({ title: notice.title, message: summary });
  let smsCount = 0;
  let voiceCount = 0;

  for (const citizen of citizens) {
    await notify({
      recipientId: citizen._id,
      recipientRole: ROLES.CITIZEN,
      title: notice.title,
      message: summary,
      type: NotificationType.Info,
      module: NotificationModule.Notice,
      channels: noticeChannels,
      purpose: NotificationPurpose.NoticeBroadcast,
      broadcastId,
      i18n,
      entityId: notice.id,
      to: citizen.mobile,
    });
    if (channels.sms) smsCount += 1;
    if (channels.voice) voiceCount += 1;
  }

  return { recipientCount: citizens.length, sms: smsCount, voice: voiceCount };
}
