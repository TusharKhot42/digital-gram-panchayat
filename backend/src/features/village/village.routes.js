import { Router } from 'express';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { uploadVillageImages } from '../../middlewares/upload.middleware.js';
import * as controller from './village.controller.js';

/** Public village profile — mounted at /api/v1/village. No auth (powers the public home page). */
export const villageRouter = Router();
villageRouter.get('/', controller.getPublic);

/** Officer editor — mounted at /api/v1/admin/village. */
export const adminVillageRouter = Router();
adminVillageRouter.put(
  '/',
  authenticate,
  authorize(ROLES.OFFICER),
  uploadVillageImages,
  controller.update,
);
