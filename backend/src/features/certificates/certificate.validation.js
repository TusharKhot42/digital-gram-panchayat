import { body, param, query } from 'express-validator';
import { CERT_TYPES, DAKHALA_STATUSES } from '@dgp/shared';

// Per-type applicationData required fields are validated in the service (dynamic).
export const applyValidation = [
  body('certificateType').isIn(CERT_TYPES).withMessage('Choose a valid certificate type'),
];

export const idParamValidation = [param('id').isMongoId().withMessage('Invalid application id')];

export const rejectValidation = [
  param('id').isMongoId().withMessage('Invalid application id'),
  body('reason').trim().isLength({ min: 3 }).withMessage('A rejection reason is required'),
];

export const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(DAKHALA_STATUSES),
  query('certificateType').optional().isIn(CERT_TYPES),
];
