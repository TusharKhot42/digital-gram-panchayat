import { z } from 'zod';
import { TAX_TYPES } from '../constants/index.js';

/** Financial year like 2025-2026. */
const financialYearSchema = z
  .string()
  .regex(/^\d{4}-\d{4}$/, 'Financial year must look like 2025-2026');

export const taxTypeSchema = z.enum(TAX_TYPES);

export const createTaxRecordSchema = z.object({
  citizenId: z.string().min(1, 'Citizen is required'),
  propertyNumber: z.string().trim().min(1, 'Property number is required'),
  taxType: taxTypeSchema,
  financialYear: financialYearSchema,
  amount: z.coerce.number().min(0, 'Amount cannot be negative'),
  dueDate: z.string().optional().or(z.literal('')),
});

export const updateTaxRecordSchema = z.object({
  propertyNumber: z.string().trim().min(1).optional(),
  amount: z.coerce.number().min(0, 'Amount cannot be negative').optional(),
  dueDate: z.string().optional().or(z.literal('')),
});

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive('Payment must be greater than zero'),
  paidAt: z.string().optional().or(z.literal('')),
  receiptNo: z.string().trim().optional().or(z.literal('')),
  mode: z.string().trim().optional().or(z.literal('')),
});
