import { Router } from 'express';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import * as controller from './audit.controller.js';

/** Officer audit-trail viewer — mounted at /api/v1/admin/audit. Read-only. */
export const adminAuditRouter = Router();

adminAuditRouter.use(authenticate, authorize(ROLES.OFFICER));
adminAuditRouter.get('/', controller.list);
