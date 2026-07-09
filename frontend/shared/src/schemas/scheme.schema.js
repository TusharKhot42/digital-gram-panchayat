import { z } from 'zod';
import { SCHEME_CATEGORIES } from '../constants/index.js';

/**
 * Scheme validation contract. Frontend forms validate against these; the backend mirrors
 * the same rules with express-validator. The optional image is validated at the upload layer.
 */

export const schemeCategorySchema = z.enum(SCHEME_CATEGORIES);

export const createSchemeSchema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(160, 'Title is too long'),
  summary: z.string().trim().max(300, 'Summary is too long').optional().or(z.literal('')),
  description: z
    .string()
    .trim()
    .min(5, 'Description is required')
    .max(10000, 'Description is too long'),
  category: schemeCategorySchema.default('Other'),
  eligibility: z.string().trim().max(5000).optional().or(z.literal('')),
  requiredDocuments: z.array(z.string().trim()).optional(),
  benefits: z.string().trim().max(5000).optional().or(z.literal('')),
  applicationProcess: z.string().trim().max(5000).optional().or(z.literal('')),
  officialWebsite: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
  publishDate: z.string().optional().or(z.literal('')),
  expiryDate: z.string().optional().or(z.literal('')),
  isPublished: z.coerce.boolean().optional(),
});

export const updateSchemeSchema = createSchemeSchema.partial();
