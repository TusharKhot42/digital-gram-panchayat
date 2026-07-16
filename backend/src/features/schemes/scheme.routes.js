import { Router } from 'express';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { uploadSchemeFiles } from '../../middlewares/upload.middleware.js';
import * as controller from './scheme.controller.js';
import {
  createSchemeValidation,
  updateSchemeValidation,
  schemeIdParamValidation,
  listQueryValidation,
} from './scheme.validation.js';

/** Public scheme routes — mounted at /api/v1/schemes (no auth). */
export const schemeRouter = Router();

schemeRouter.get('/', listQueryValidation, validate, controller.publicList);
schemeRouter.get('/:id', schemeIdParamValidation, validate, controller.publicDetail);

/** Officer scheme routes — mounted at /api/v1/admin/schemes. */
export const adminSchemeRouter = Router();

adminSchemeRouter.use(authenticate, authorize(ROLES.OFFICER));

adminSchemeRouter.get('/', listQueryValidation, validate, controller.adminList);
adminSchemeRouter.get('/:id', schemeIdParamValidation, validate, controller.adminGetOne);
adminSchemeRouter.post('/', uploadSchemeFiles, createSchemeValidation, validate, controller.create);
adminSchemeRouter.put(
  '/:id',
  uploadSchemeFiles,
  updateSchemeValidation,
  validate,
  controller.update,
);
adminSchemeRouter.patch('/:id/publish', schemeIdParamValidation, validate, controller.publish);
adminSchemeRouter.patch('/:id/unpublish', schemeIdParamValidation, validate, controller.unpublish);
adminSchemeRouter.delete('/:id', schemeIdParamValidation, validate, controller.remove);
