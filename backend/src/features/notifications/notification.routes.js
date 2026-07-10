import { Router } from 'express';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { broadcastLimiter } from '../../middlewares/rate-limit.middleware.js';
import * as controller from './notification.controller.js';
import {
  idParamValidation,
  mineQueryValidation,
  adminListValidation,
  broadcastValidation,
} from './notification.validation.js';

/** In-app notifications for any authenticated user — mounted at /api/v1/notifications. */
export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get('/', mineQueryValidation, validate, controller.listMine);
notificationRouter.get('/unread-count', controller.unreadCount);
notificationRouter.patch('/read-all', controller.markAllRead);
notificationRouter.get('/:id', idParamValidation, validate, controller.getMine);
notificationRouter.patch('/:id/read', idParamValidation, validate, controller.markRead);

/** Officer notification management — mounted at /api/v1/admin/notifications. */
export const adminNotificationRouter = Router();

adminNotificationRouter.use(authenticate, authorize(ROLES.OFFICER));

adminNotificationRouter.get('/', adminListValidation, validate, controller.adminList);
adminNotificationRouter.get('/stats', controller.stats);
adminNotificationRouter.post(
  '/broadcast',
  broadcastLimiter,
  broadcastValidation,
  validate,
  controller.broadcast,
);
adminNotificationRouter.get('/:id', idParamValidation, validate, controller.adminGetOne);
adminNotificationRouter.post('/:id/retry', idParamValidation, validate, controller.retry);
