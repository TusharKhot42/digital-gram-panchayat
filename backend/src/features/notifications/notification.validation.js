import { body, param, query } from 'express-validator';
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TYPES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_MODULES,
} from '@dgp/shared';

export const idParamValidation = [param('id').isMongoId().withMessage('Invalid notification id')];

export const mineQueryValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('module').optional().isIn(NOTIFICATION_MODULES),
];

export const adminListValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(NOTIFICATION_STATUSES),
  query('channel').optional().isIn(NOTIFICATION_CHANNELS),
  query('module').optional().isIn(NOTIFICATION_MODULES),
];

export const broadcastValidation = [
  body('title').trim().isLength({ min: 3, max: 160 }).withMessage('Title is required'),
  body('message').trim().isLength({ min: 3, max: 1000 }).withMessage('Message is required'),
  body('type').optional().isIn(NOTIFICATION_TYPES),
  body('targetRole').optional().isIn(['citizen', 'officer']),
  body('channels').optional().isArray().withMessage('Channels must be an array'),
  body('channels.*').optional().isIn(NOTIFICATION_CHANNELS),
];
