import { Router } from 'express';
import { body } from 'express-validator';
import { ROLES, FEEDBACK_CATEGORIES, FEEDBACK_RATING_MIN, FEEDBACK_RATING_MAX } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as controller from './feedback.controller.js';

/**
 * Citizen feedback — mounted at /api/v1/feedback.
 *
 * The per-service averages are public, because a village should be able to see how its own
 * services are rated. Giving feedback requires signing in: without an account behind each
 * entry, one person with a browser could decide the village's opinion.
 */
export const feedbackRouter = Router();
feedbackRouter.get('/summary', controller.summary);
feedbackRouter.post(
  '/',
  authenticate,
  authorize(ROLES.CITIZEN),
  body('category').isIn(FEEDBACK_CATEGORIES).withMessage('Choose a service'),
  body('rating')
    .isInt({ min: FEEDBACK_RATING_MIN, max: FEEDBACK_RATING_MAX })
    .withMessage('Rating must be between 1 and 5'),
  body('comment').optional({ values: 'falsy' }).isLength({ max: 1000 }),
  validate,
  controller.submit,
);
feedbackRouter.get('/mine', authenticate, authorize(ROLES.CITIZEN), controller.mine);

/** Officer analytics — mounted at /api/v1/admin/feedback. */
export const adminFeedbackRouter = Router();
adminFeedbackRouter.use(authenticate, authorize(ROLES.OFFICER));
adminFeedbackRouter.get('/', controller.list);
adminFeedbackRouter.get('/analytics', controller.analytics);
