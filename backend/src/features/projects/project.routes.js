import { Router } from 'express';
import { body } from 'express-validator';
import { ROLES, PROJECT_CATEGORIES, PROJECT_STATUSES, FUNDING_SOURCES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { uploadProjectPhotos } from '../../middlewares/upload.middleware.js';
import * as controller from './project.controller.js';

const projectValidation = [
  body('name').trim().isLength({ min: 3, max: 200 }).withMessage('Project name is required'),
  body('category').optional({ values: 'falsy' }).isIn(PROJECT_CATEGORIES),
  body('status').optional({ values: 'falsy' }).isIn(PROJECT_STATUSES),
  body('fundingSource').optional({ values: 'falsy' }).isIn(FUNDING_SOURCES),
  body('budget').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('amountSpent').optional({ values: 'falsy' }).isFloat({ min: 0 }),
  body('progress').optional({ values: 'falsy' }).isInt({ min: 0, max: 100 }),
];

/**
 * Public development works — mounted at /api/v1/projects.
 * `/summary` is declared before `/:id` so it is not swallowed as an id.
 */
export const projectRouter = Router();
projectRouter.get('/', controller.publicList);
projectRouter.get('/summary', controller.publicSummary);
projectRouter.get('/:id', controller.publicDetail);

/** Officer project management — mounted at /api/v1/admin/projects. */
export const adminProjectRouter = Router();
adminProjectRouter.use(authenticate, authorize(ROLES.OFFICER));
adminProjectRouter.get('/', controller.list);
adminProjectRouter.get('/:id', controller.detail);
adminProjectRouter.post('/', uploadProjectPhotos, projectValidation, validate, controller.create);
adminProjectRouter.put('/:id', uploadProjectPhotos, controller.update);
adminProjectRouter.delete('/:id', controller.remove);
