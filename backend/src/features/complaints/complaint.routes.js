import { Router } from 'express';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { uploadComplaintImages } from '../../middlewares/upload.middleware.js';
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
  authenticate,
  authorize(ROLES.CITIZEN),
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
