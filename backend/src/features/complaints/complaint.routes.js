import { Router } from 'express';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { uploadComplaintImages } from '../../middlewares/upload.middleware.js';
import { idempotency } from '../../middlewares/idempotency.middleware.js';
import { complaintLimiter } from '../../middlewares/rate-limit.middleware.js';
import * as controller from './complaint.controller.js';
import {
  createComplaintValidation,
  complaintIdParamValidation,
  updateStatusValidation,
  listQueryValidation,
} from './complaint.validation.js';

/** Citizen complaint routes — mounted at /api/v1/complaints */
export const complaintRouter = Router();

complaintRouter.post(
  '/',
  complaintLimiter,
  authenticate,
  authorize(ROLES.CITIZEN),
  // Idempotency runs after auth (so the key is scoped to an authenticated request) and
  // before upload/validate — a replayed offline complaint returns the original result.
  idempotency,
  uploadComplaintImages,
  createComplaintValidation,
  validate,
  controller.create,
);
complaintRouter.get('/mine', authenticate, authorize(ROLES.CITIZEN), controller.listMine);
complaintRouter.get('/:id', authenticate, complaintIdParamValidation, validate, controller.getOne);

/** Officer complaint routes — mounted at /api/v1/admin/complaints */
export const adminComplaintRouter = Router();

adminComplaintRouter.get(
  '/',
  authenticate,
  authorize(ROLES.OFFICER),
  listQueryValidation,
  validate,
  controller.adminList,
);
adminComplaintRouter.get(
  '/:id',
  authenticate,
  authorize(ROLES.OFFICER),
  complaintIdParamValidation,
  validate,
  controller.getOne,
);
adminComplaintRouter.patch(
  '/:id/status',
  authenticate,
  authorize(ROLES.OFFICER),
  updateStatusValidation,
  validate,
  controller.updateStatus,
);
