import { z } from 'zod';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  MAX_COMPLAINT_PHOTOS,
} from '../constants/index.js';

/**
 * Complaint validation contract. Frontend forms validate against these; the backend
 * mirrors the same rules with express-validator. Photos are validated separately at the
 * upload layer (count/size/mime), not here.
 */

export const complaintCategorySchema = z.enum(COMPLAINT_CATEGORIES);
export const complaintStatusSchema = z.enum(COMPLAINT_STATUSES);

export const createComplaintSchema = z.object({
  category: complaintCategorySchema,
  title: z.string().trim().min(3, 'Title is too short').max(120, 'Title is too long'),
  description: z
    .string()
    .trim()
    .min(5, 'Please describe the issue')
    .max(2000, 'Description is too long'),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  ward: z.string().trim().optional().or(z.literal('')),
});

export const updateComplaintStatusSchema = z
  .object({
    status: complaintStatusSchema,
    remark: z.string().trim().max(1000).optional().or(z.literal('')),
  })
  .refine((v) => v.status !== 'Resolved' || (v.remark && v.remark.trim().length > 0), {
    message: 'A remark is required when resolving a complaint',
    path: ['remark'],
  });

export const MAX_PHOTOS = MAX_COMPLAINT_PHOTOS;
