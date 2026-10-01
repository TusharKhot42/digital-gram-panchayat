import { Router } from 'express';
import { ROLES } from '@dgp/shared';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize, authorizeRootAdmin } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authLimiter, loginThrottle } from '../../middlewares/rate-limit.middleware.js';
import * as controller from './auth.controller.js';
import {
  registerValidation,
  loginValidation,
  officerLoginValidation,
  registerOfficerValidation,
  unifiedLoginValidation,
  updateProfileValidation,
} from './auth.validation.js';

/** Citizen auth — mounted at /api/v1/auth */
export const citizenAuthRouter = Router();

citizenAuthRouter.post('/register', authLimiter, registerValidation, validate, controller.register);
citizenAuthRouter.post(
  '/login',
  authLimiter,
  loginThrottle,
  loginValidation,
  validate,
  controller.login,
);
// Shared login page: identifier (mobile or email) + password, any role. The role-specific
// /auth/login and /admin/login endpoints stay for backward compatibility.
citizenAuthRouter.post(
  '/session',
  authLimiter,
  loginThrottle,
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
  loginThrottle,
  officerLoginValidation,
  validate,
  controller.officerLogin,
);
adminAuthRouter.get('/profile', authenticate, authorize(ROLES.OFFICER), controller.profile);
adminAuthRouter.post('/logout', authenticate, controller.logout);

// Admin staff management
adminAuthRouter.get('/admins', authenticate, authorize(ROLES.OFFICER), controller.listAdmins);
adminAuthRouter.post(
  '/admins',
  authenticate,
  authorize(ROLES.OFFICER),
  authorizeRootAdmin,
  registerOfficerValidation,
  validate,
  controller.registerOfficer,
);
