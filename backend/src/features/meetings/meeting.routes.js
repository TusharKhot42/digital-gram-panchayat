import { Router } from 'express';
import { body } from 'express-validator';
import { ROLES, MEETING_TYPES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { uploadMeetingFiles } from '../../middlewares/upload.middleware.js';
import * as controller from './meeting.controller.js';

const meetingValidation = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title is required'),
  body('scheduledAt').notEmpty().isISO8601().withMessage('A valid date and time is required'),
  body('endsAt').optional({ values: 'falsy' }).isISO8601(),
  body('meetingType').optional({ values: 'falsy' }).isIn(MEETING_TYPES),
];

/** Public Gram Sabha listing — mounted at /api/v1/meetings. */
export const meetingRouter = Router();
meetingRouter.get('/', controller.publicList);
meetingRouter.get('/:id', controller.publicDetail);

/** Officer meeting management — mounted at /api/v1/admin/meetings. */
export const adminMeetingRouter = Router();
adminMeetingRouter.use(authenticate, authorize(ROLES.OFFICER));
adminMeetingRouter.get('/', controller.list);
adminMeetingRouter.get('/:id', controller.detail);
adminMeetingRouter.post('/', uploadMeetingFiles, meetingValidation, validate, controller.create);
adminMeetingRouter.put('/:id', uploadMeetingFiles, controller.update);
adminMeetingRouter.delete('/:id', controller.remove);
