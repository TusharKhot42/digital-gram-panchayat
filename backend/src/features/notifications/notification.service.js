import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

/**
 * Notification stub. In mock mode (default) it just logs — enough to prove the
 * status-change notify path end-to-end. The real Twilio/MSG91 provider is wired in
 * Milestone 4 (blueprint 5.9); this interface stays the same so callers don't change.
 *
 * @param {{ to: string, body: string, purpose: string }} message
 * @returns {Promise<{ status: 'sent'|'skipped' }>}
 */
export async function sendSms({ to, body, purpose }) {
  if (env.SMS_PROVIDER === 'mock') {
    logger.info(`[SMS mock] to=${to} purpose=${purpose} :: ${body}`);
    return { status: 'sent' };
  }
  // Real providers land in M4. Until then, non-mock config is a no-op we record.
  logger.warn(`[SMS] provider "${env.SMS_PROVIDER}" not wired yet — skipped (${purpose})`);
  return { status: 'skipped' };
}

/**
 * @param {{ mobile?: string, complaintId: string, status: string }} params
 */
export async function notifyComplaintStatus({ mobile, complaintId, status }) {
  if (!mobile) return { status: 'skipped' };
  return sendSms({
    to: mobile,
    body: `Your complaint ${complaintId} is now "${status}".`,
    purpose: 'complaintUpdate',
  });
}
