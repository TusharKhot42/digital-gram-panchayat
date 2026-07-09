import { Router } from 'express';
import { query } from 'express-validator';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as controller from './tax.controller.js';
import {
  createTaxValidation,
  updateTaxValidation,
  paymentValidation,
  taxIdParamValidation,
  listQueryValidation,
  mineQueryValidation,
} from './tax.validation.js';

/** Citizen tax routes (view-only) — mounted at /api/v1/tax. */
export const taxRouter = Router();

taxRouter.get(
  '/mine',
  authenticate,
  authorize(ROLES.CITIZEN),
  mineQueryValidation,
  validate,
  controller.listMine,
);

/** Officer tax routes — mounted at /api/v1/admin/tax. */
export const adminTaxRouter = Router();

adminTaxRouter.use(authenticate, authorize(ROLES.OFFICER));

adminTaxRouter.get(
  '/lookup',
  query('mobile')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit mobile'),
  validate,
  controller.lookupCitizen,
);
adminTaxRouter.get('/', listQueryValidation, validate, controller.adminList);
adminTaxRouter.get('/:id', taxIdParamValidation, validate, controller.adminGetOne);
adminTaxRouter.get('/:id/history', taxIdParamValidation, validate, controller.history);
adminTaxRouter.post('/', createTaxValidation, validate, controller.create);
adminTaxRouter.patch('/:id', updateTaxValidation, validate, controller.update);
adminTaxRouter.post('/:id/payment', paymentValidation, validate, controller.addPayment);
