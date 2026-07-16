import { Router } from 'express';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authLimiter } from '../../middlewares/rate-limit.middleware.js';
import * as controller from './auth.controller.js';
import {
  registerValidation,
  loginValidation,
  officerLoginValidation,
  unifiedLoginValidation,
  updateProfileValidation,
} from './auth.validation.js';

/** Citizen auth — mounted at /api/v1/auth */
export const citizenAuthRouter = Router();

citizenAuthRouter.post('/register', authLimiter, registerValidation, validate, controller.register);
citizenAuthRouter.post('/login', authLimiter, loginValidation, validate, controller.login);
// Shared login page: identifier (mobile or email) + password, any role. The role-specific
// /auth/login and /admin/login endpoints stay for backward compatibility.
citizenAuthRouter.post(
  '/session',
  authLimiter,
  unifiedLoginValidation,
  validate,
  controller.unifiedLogin,
);
citizenAuthRouter.get('/profile', authenticate, authorize(ROLES.CITIZEN), controller.profile);
citizenAuthRouter.put(
  '/profile',
  authenticate,
  authorize(ROLES.CITIZEN),
  updateProfileValidation,
  validate,
  controller.updateProfile,
);
citizenAuthRouter.post('/logout', authenticate, controller.logout);

/** Officer (admin portal) auth — mounted at /api/v1/admin */
export const adminAuthRouter = Router();

adminAuthRouter.post(
  '/login',
  authLimiter,
  officerLoginValidation,
  validate,
  controller.officerLogin,
);
adminAuthRouter.get('/profile', authenticate, authorize(ROLES.OFFICER), controller.profile);
adminAuthRouter.post('/logout', authenticate, controller.logout);
