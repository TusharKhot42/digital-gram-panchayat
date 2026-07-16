import { Router } from 'express';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import * as controller from './dashboard.controller.js';

/** Officer dashboard — mounted at /api/v1/admin/dashboard. */
export const adminDashboardRouter = Router();

adminDashboardRouter.use(authenticate, authorize(ROLES.OFFICER));

adminDashboardRouter.get('/metrics', controller.metrics);
adminDashboardRouter.get('/charts', controller.charts);
adminDashboardRouter.get('/activity', controller.activity);
adminDashboardRouter.get('/report', controller.report);
