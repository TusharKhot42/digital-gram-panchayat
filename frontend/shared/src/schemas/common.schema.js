import { z } from 'zod';

/** Generic, feature-agnostic schemas. Feature-specific schemas (complaint, dakhala, ...) land
 *  in their own milestone alongside the feature, not here. */

export const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const mobileNumberSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

export const languageSchema = z.enum(['en', 'mr']);
