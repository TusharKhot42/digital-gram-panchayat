import { body } from 'express-validator';
import { VALIDATION } from '@dgp/shared';

export const registerValidation = [
  body('fullName')
    .trim()
    .isLength({ min: VALIDATION.FULLNAME_MIN_LENGTH, max: VALIDATION.FULLNAME_MAX_LENGTH })
    .withMessage('Full name is required'),
  body('mobile').matches(VALIDATION.MOBILE_REGEX).withMessage(VALIDATION.MOBILE_MESSAGE),
  body('password')
    .isLength({ min: VALIDATION.PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`),
  body('village').trim().notEmpty().withMessage('Village is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Enter a valid email'),
];

export const loginValidation = [
  body('mobile').matches(VALIDATION.MOBILE_REGEX).withMessage(VALIDATION.MOBILE_MESSAGE),
  body('password').notEmpty().withMessage('Password is required'),
];

export const officerLoginValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidation = [
  body('fullName')
    .trim()
    .isLength({ min: VALIDATION.FULLNAME_MIN_LENGTH, max: VALIDATION.FULLNAME_MAX_LENGTH })
    .withMessage('Full name is required'),
  body('village').trim().notEmpty().withMessage('Village is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Enter a valid email'),
];
