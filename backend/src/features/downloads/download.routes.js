import { Router } from 'express';
import { body } from 'express-validator';
import { ROLES, DOWNLOAD_CATEGORIES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { uploadDocumentFile } from '../../middlewares/upload.middleware.js';
import * as controller from './download.controller.js';

/**
 * Public download centre — mounted at /api/v1/downloads. Forms, circulars and reports are
 * public documents; requiring a login to read a published circular would defeat the purpose.
 */
export const downloadRouter = Router();
downloadRouter.get('/', controller.publicList);
downloadRouter.post('/:id/open', controller.open);

/** Officer document management — mounted at /api/v1/admin/downloads. */
export const adminDownloadRouter = Router();
adminDownloadRouter.use(authenticate, authorize(ROLES.OFFICER));
adminDownloadRouter.get('/', controller.list);
adminDownloadRouter.post(
  '/',
  uploadDocumentFile,
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title is required'),
  body('category').optional({ values: 'falsy' }).isIn(DOWNLOAD_CATEGORIES),
  validate,
  controller.create,
);
adminDownloadRouter.put('/:id', uploadDocumentFile, controller.update);
adminDownloadRouter.delete('/:id', controller.remove);
