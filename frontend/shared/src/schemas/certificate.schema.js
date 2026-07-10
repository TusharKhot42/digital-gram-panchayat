import { z } from 'zod';
import { CERT_TYPES } from '../constants/index.js';

export const certTypeSchema = z.enum(CERT_TYPES);

/**
 * Apply schema. applicationData is an open object here — the per-type required-field
 * check runs on the backend against CERT_TYPE_FIELDS (single source), because the
 * required keys differ by certificate type.
 */
export const applyCertificateSchema = z.object({
  certificateType: certTypeSchema,
  applicationData: z.record(z.string(), z.any()),
});

export const rejectCertificateSchema = z.object({
  reason: z.string().trim().min(3, 'A rejection reason is required'),
});
