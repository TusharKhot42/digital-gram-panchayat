import { Router } from 'express';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { uploadNoticeAttachment } from '../../middlewares/upload.middleware.js';
import { broadcastLimiter } from '../../middlewares/rate-limit.middleware.js';
import * as controller from './notice.controller.js';
import {
  createNoticeValidation,
  updateNoticeValidation,
  noticeIdParamValidation,
  broadcastValidation,
  listQueryValidation,
} from './notice.validation.js';

/** Public notice routes — mounted at /api/v1/notices (no auth). */
export const noticeRouter = Router();

noticeRouter.get('/', listQueryValidation, validate, controller.publicList);
noticeRouter.get('/:id', noticeIdParamValidation, validate, controller.publicDetail);

/** Officer notice routes — mounted at /api/v1/admin/notices. */
export const adminNoticeRouter = Router();

adminNoticeRouter.use(authenticate, authorize(ROLES.OFFICER));

adminNoticeRouter.get('/', listQueryValidation, validate, controller.adminList);
adminNoticeRouter.get('/:id', noticeIdParamValidation, validate, controller.adminGetOne);
adminNoticeRouter.post(
  '/',
  uploadNoticeAttachment,
  createNoticeValidation,
  validate,
  controller.create,
);
adminNoticeRouter.put(
  '/:id',
  uploadNoticeAttachment,
  updateNoticeValidation,
  validate,
  controller.update,
);
adminNoticeRouter.patch('/:id/publish', noticeIdParamValidation, validate, controller.publish);
adminNoticeRouter.patch('/:id/archive', noticeIdParamValidation, validate, controller.archive);
adminNoticeRouter.delete('/:id', noticeIdParamValidation, validate, controller.remove);
adminNoticeRouter.post(
  '/:id/broadcast',
  broadcastLimiter,
  broadcastValidation,
  validate,
  controller.broadcast,
);
