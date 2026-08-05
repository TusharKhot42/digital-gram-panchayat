import { Router } from 'express';
import { body } from 'express-validator';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { uploadSingleImage } from '../../middlewares/upload.middleware.js';
import * as controller from './event.controller.js';

const eventValidation = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title is required'),
  body('startDate').notEmpty().isISO8601().withMessage('A valid start date is required'),
  body('endDate').optional({ values: 'falsy' }).isISO8601(),
];

/** Public events — mounted at /api/v1/events. */
export const eventRouter = Router();
eventRouter.get('/', controller.publicList);

/** Officer events CRUD — mounted at /api/v1/admin/events. Banner under `image`. */
export const adminEventRouter = Router();
adminEventRouter.use(authenticate, authorize(ROLES.OFFICER));
adminEventRouter.get('/', controller.list);
adminEventRouter.post('/', uploadSingleImage, eventValidation, validate, controller.create);
// Update validated to the same rules as create; previously it accepted anything.
const eventUpdateValidation = [
  body('title').optional({ values: 'falsy' }).trim().isLength({ min: 3, max: 200 }),
  body('startDate').optional({ values: 'falsy' }).isISO8601(),
  body('endDate').optional({ values: 'falsy' }).isISO8601(),
];
adminEventRouter.put('/:id', uploadSingleImage, eventUpdateValidation, validate, controller.update);
adminEventRouter.delete('/:id', controller.remove);
