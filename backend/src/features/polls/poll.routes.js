import { Router } from 'express';
import { body } from 'express-validator';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as controller from './poll.controller.js';

/**
 * Polls need a signed-in citizen even to read. The response is personalised — it reports
 * whether this citizen has already voted — and the tallies stay hidden until they have.
 */
export const pollRouter = Router();
pollRouter.use(authenticate, authorize(ROLES.CITIZEN));
pollRouter.get('/', controller.publicList);
pollRouter.post(
  '/:id/vote',
  body('optionId').notEmpty().withMessage('Choose an option'),
  validate,
  controller.vote,
);

/** Officer poll management — mounted at /api/v1/admin/polls. */
export const adminPollRouter = Router();
adminPollRouter.use(authenticate, authorize(ROLES.OFFICER));
adminPollRouter.get('/', controller.list);
adminPollRouter.post(
  '/',
  body('question').trim().isLength({ min: 3, max: 300 }).withMessage('Question is required'),
  validate,
  controller.create,
);
// Only publication and closing time are editable; both are validated.
adminPollRouter.put(
  '/:id',
  body('closesAt').optional({ values: 'falsy' }).isISO8601(),
  body('isPublished').optional().isBoolean(),
  validate,
  controller.update,
);
adminPollRouter.delete('/:id', controller.remove);
