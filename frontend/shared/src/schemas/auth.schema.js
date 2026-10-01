import { z } from 'zod';
import { VALIDATION } from '../constants/index.js';

/**
 * Auth validation schemas — shared contract. Frontend forms and backend tests validate
 * against these; the backend request layer mirrors the same rules via express-validator.
 */

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(VALIDATION.FULLNAME_MIN_LENGTH, 'Full name is too short')
    .max(VALIDATION.FULLNAME_MAX_LENGTH, 'Full name is too long'),
  mobile: z.string().regex(VALIDATION.MOBILE_REGEX, VALIDATION.MOBILE_MESSAGE),
  password: z
    .string()
    .min(
      VALIDATION.PASSWORD_MIN_LENGTH,
      `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
    ),
  village: z.string().trim().min(1, 'Village is required'),
  ward: z.string().trim().min(1, 'Ward is required').optional().or(z.literal('')),
  address: z.string().trim().min(1, 'Address is required'),
  email: z
    .string()
    .regex(VALIDATION.EMAIL_REGEX, 'Enter a valid email')
    .optional()
    .or(z.literal('')),
});

export const loginSchema = z.object({
  mobile: z.string().regex(VALIDATION.MOBILE_REGEX, VALIDATION.MOBILE_MESSAGE),
  password: z.string().min(1, 'Password is required'),
});

export const officerLoginSchema = z.object({
  email: z.string().regex(VALIDATION.EMAIL_REGEX, 'Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(VALIDATION.FULLNAME_MIN_LENGTH, 'Full name is too short')
    .max(VALIDATION.FULLNAME_MAX_LENGTH, 'Full name is too long'),
  village: z.string().trim().min(1, 'Village is required'),
  ward: z.string().trim().optional().or(z.literal('')),
  address: z.string().trim().min(1, 'Address is required'),
  email: z
    .string()
    .regex(VALIDATION.EMAIL_REGEX, 'Enter a valid email')
    .optional()
    .or(z.literal('')),
});
