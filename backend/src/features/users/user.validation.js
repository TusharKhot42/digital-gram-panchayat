import { body, param, query } from 'express-validator';
import { ROLES } from '@dgp/shared';

export const listUsersValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('role').optional().isIn([ROLES.CITIZEN, ROLES.OFFICER]),
  query('status').optional().isIn(['active', 'inactive']),
];

export const userIdParamValidation = [param('id').isMongoId().withMessage('Invalid user id')];

export const statusValidation = [
  param('id').isMongoId().withMessage('Invalid user id'),
  body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
];
