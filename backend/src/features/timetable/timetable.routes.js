import { Router } from 'express';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import * as controller from './timetable.controller.js';

export const timetableRouter = Router();
timetableRouter.get('/', controller.getTimetable);

export const adminTimetableRouter = Router();
adminTimetableRouter.use(authenticate, authorize(ROLES.OFFICER));
adminTimetableRouter.get('/', controller.getTimetable);
adminTimetableRouter.put('/', controller.updateTimetable);
adminTimetableRouter.post('/reset', controller.resetTimetable);
