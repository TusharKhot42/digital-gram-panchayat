import { z } from 'zod';
import { NOTIFICATION_CHANNELS, NOTIFICATION_TYPES } from '../constants/index.js';

/** Officer broadcast: title + message to a target role over one or more channels. */
export const broadcastNotificationSchema = z
  .object({
    title: z.string().trim().min(3, 'Title is required').max(160, 'Title is too long'),
    message: z.string().trim().min(3, 'Message is required').max(1000, 'Message is too long'),
    type: z.enum(NOTIFICATION_TYPES).default('info'),
    targetRole: z.enum(['citizen', 'officer']).default('citizen'),
    channels: z
      .array(z.enum(NOTIFICATION_CHANNELS))
      .min(1, 'Choose at least one channel')
      .default(['inApp']),
  })
  .refine((v) => v.channels.includes('inApp') || v.channels.length > 0, {
    message: 'Choose at least one channel',
    path: ['channels'],
  });
