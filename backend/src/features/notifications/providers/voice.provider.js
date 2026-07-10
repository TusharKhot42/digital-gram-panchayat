import { randomUUID } from 'node:crypto';
import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';

/** Voice call provider (pre-recorded flow). Mock logs; real provider wired later. */
export const voiceProvider = {
  channel: 'voice',
  async send({ to, message }) {
    if (env.SMS_PROVIDER === 'mock') {
      logger.info(`[voice mock] to=${to} :: ${message}`);
      return { status: 'sent', providerMessageId: `mock-voice-${randomUUID()}` };
    }
    return { status: 'failed', error: 'Voice provider not wired' };
  },
};
