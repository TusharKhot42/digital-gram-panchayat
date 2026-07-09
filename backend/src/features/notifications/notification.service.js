import { NotificationPurpose, NotificationStatus } from '@dgp/shared';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { User } from '../auth/user.model.js';
import { Notification } from './notification.model.js';

/**
 * Dispatch one message on a channel and log it. Mock mode (default) just logs to the
 * console but still records a Notification doc, so the delivery log is real from day one.
 * Real Twilio/MSG91 provider is wired in a later milestone; this interface is stable.
 *
 * @param {{ to: string, body: string, purpose: string, channel?: 'sms'|'voice', relatedEntity?: object }} message
 * @returns {Promise<{ status: string }>}
 */
async function dispatch({ to, body, purpose, channel = 'sms', relatedEntity }) {
  let status = NotificationStatus.Sent;
  let error;

  if (env.SMS_PROVIDER === 'mock') {
    logger.info(`[${channel} mock] to=${to} purpose=${purpose} :: ${body}`);
  } else {
    // Real providers land later; until then non-mock config is a recorded no-op.
    status = NotificationStatus.Failed;
    error = `provider "${env.SMS_PROVIDER}" not wired`;
    logger.warn(`[${channel}] ${error} — ${purpose}`);
  }

  try {
    await Notification.create({
      to,
      channel,
      purpose,
      body,
      status,
      error,
      relatedEntity,
      at: new Date(),
    });
  } catch (err) {
    logger.error('Notification log write failed', err);
  }

  return { status };
}

/** @param {{ to, body, purpose, relatedEntity? }} msg */
export function sendSms({ to, body, purpose, relatedEntity }) {
  return dispatch({ to, body, purpose, channel: 'sms', relatedEntity });
}

/** @param {{ to, body, purpose, relatedEntity? }} msg */
export function sendVoice({ to, body, purpose, relatedEntity }) {
  return dispatch({ to, body, purpose, channel: 'voice', relatedEntity });
}

/**
 * @param {{ mobile?: string, complaintId: string, status: string, entityId?: string }} params
 */
export async function notifyComplaintStatus({ mobile, complaintId, status, entityId }) {
  if (!mobile) return { status: 'skipped' };
  return sendSms({
    to: mobile,
    body: `Your complaint ${complaintId} is now "${status}".`,
    purpose: NotificationPurpose.ComplaintUpdate,
    relatedEntity: entityId ? { kind: 'complaint', id: entityId } : undefined,
  });
}

/**
 * Broadcast a notice summary to every active citizen with a mobile, on the chosen
 * channel(s). Returns dispatch stats. Batched async in mock mode (blueprint scale
 * hardening is M9); logs one Notification per recipient per channel.
 *
 * @param {{ notice: object, channels: { sms?: boolean, voice?: boolean }, summary: string }} params
 */
export async function broadcastNotice({ notice, channels, summary }) {
  const citizens = await User.find({ role: 'citizen', isActive: true, mobile: { $ne: null } })
    .select('mobile')
    .lean();

  const recipients = citizens.map((c) => c.mobile).filter(Boolean);
  const relatedEntity = { kind: 'notice', id: notice.id };
  const body = `${notice.title}: ${summary}`;

  let smsCount = 0;
  let voiceCount = 0;

  for (const to of recipients) {
    if (channels.sms) {
      await sendSms({ to, body, purpose: NotificationPurpose.NoticeBroadcast, relatedEntity });
      smsCount += 1;
    }
    if (channels.voice) {
      await sendVoice({ to, body, purpose: NotificationPurpose.NoticeBroadcast, relatedEntity });
      voiceCount += 1;
    }
  }

  return { recipientCount: recipients.length, sms: smsCount, voice: voiceCount };
}
