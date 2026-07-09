import { z } from 'zod';
import { NOTICE_CATEGORIES, SMS_SUMMARY_MAX_LENGTH } from '../constants/index.js';

/**
 * Notice validation contract. Frontend forms validate against these; the backend mirrors
 * the same rules with express-validator. The attachment (single PDF/image) is validated
 * at the upload layer, not here.
 */

export const noticeCategorySchema = z.enum(NOTICE_CATEGORIES);

export const createNoticeSchema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(160, 'Title is too long'),
  summary: z
    .string()
    .trim()
    .max(SMS_SUMMARY_MAX_LENGTH, `Summary must be ${SMS_SUMMARY_MAX_LENGTH} characters or fewer`)
    .optional()
    .or(z.literal('')),
  content: z.string().trim().min(5, 'Notice content is required').max(10000, 'Content is too long'),
  category: noticeCategorySchema.default('General'),
  publishDate: z.string().optional().or(z.literal('')),
  expiryDate: z.string().optional().or(z.literal('')),
  isPublished: z.coerce.boolean().optional(),
});

export const updateNoticeSchema = createNoticeSchema.partial();

export const broadcastSchema = z
  .object({
    sms: z.coerce.boolean().optional().default(false),
    voice: z.coerce.boolean().optional().default(false),
    summary: z
      .string()
      .trim()
      .min(1, 'A summary is required to broadcast')
      .max(SMS_SUMMARY_MAX_LENGTH, `Summary must be ${SMS_SUMMARY_MAX_LENGTH} characters or fewer`),
  })
  .refine((v) => v.sms || v.voice, {
    message: 'Choose at least one channel (SMS or voice)',
    path: ['sms'],
  });
