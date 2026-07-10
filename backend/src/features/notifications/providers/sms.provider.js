import { randomUUID } from 'node:crypto';
import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';

/**
 * SMS provider. Selects the concrete backend from SMS_PROVIDER (mock | twilio | msg91).
 * Twilio/MSG91 are wired only when their env credentials are present; otherwise they
 * report a clear failure so the retry path is exercisable. Mock always "sends".
 */
export const smsProvider = {
  channel: 'sms',
  async send({ to, message }) {
    if (env.SMS_PROVIDER === 'mock') {
      logger.info(`[sms mock] to=${to} :: ${message}`);
      return { status: 'sent', providerMessageId: `mock-${randomUUID()}` };
    }
    if (env.SMS_PROVIDER === 'twilio') {
      if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
        return { status: 'failed', error: 'Twilio credentials not configured' };
      }
      // Real Twilio dispatch would go here; kept out until credentials + client are added.
      return { status: 'failed', error: 'Twilio client not wired' };
    }
    if (env.SMS_PROVIDER === 'msg91') {
      if (!env.MSG91_API_KEY) {
        return { status: 'failed', error: 'MSG91 credentials not configured' };
      }
      return { status: 'failed', error: 'MSG91 client not wired' };
    }
    return { status: 'failed', error: `Unknown SMS provider "${env.SMS_PROVIDER}"` };
  },
};
