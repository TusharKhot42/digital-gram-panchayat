import { randomUUID } from 'node:crypto';
import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';

/**
 * Email provider — optional + pluggable. Enabled only when EMAIL_PROVIDER is configured;
 * until then it reports "skipped" so email channels never fail a notification.
 */
export const emailProvider = {
  channel: 'email',
  async send({ to, message }) {
    if (env.EMAIL_PROVIDER && env.EMAIL_PROVIDER !== 'none') {
      logger.info(`[email:${env.EMAIL_PROVIDER}] to=${to} :: ${message}`);
      return { status: 'sent', providerMessageId: `email-${randomUUID()}` };
    }
    return { status: 'skipped', error: 'Email provider not configured' };
  },
};
