import { body, param, query } from 'express-validator';
import { SCHEME_CATEGORIES } from '@dgp/shared';

export const createSchemeValidation = [
  body('title').trim().isLength({ min: 3, max: 160 }).withMessage('Title is required'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 10000 })
    .withMessage('Description is required'),
  body('summary').optional({ values: 'falsy' }).trim().isLength({ max: 300 }),
  body('category')
    .optional({ values: 'falsy' })
    .isIn(SCHEME_CATEGORIES)
    .withMessage('Invalid category'),
  body('officialWebsite')
    .optional({ values: 'falsy' })
    .trim()
    .isURL()
    .withMessage('Enter a valid URL'),
  body('publishDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid publish date'),
  body('expiryDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid expiry date'),
];

export const updateSchemeValidation = [
  param('id').isMongoId().withMessage('Invalid scheme id'),
  body('title').optional({ values: 'falsy' }).trim().isLength({ min: 3, max: 160 }),
  body('description').optional({ values: 'falsy' }).trim().isLength({ min: 5, max: 10000 }),
  body('summary').optional({ values: 'falsy' }).trim().isLength({ max: 300 }),
  body('category').optional({ values: 'falsy' }).isIn(SCHEME_CATEGORIES),
  body('officialWebsite')
    .optional({ values: 'falsy' })
    .trim()
    .isURL()
    .withMessage('Enter a valid URL'),
  body('publishDate').optional({ values: 'falsy' }).isISO8601(),
  body('expiryDate').optional({ values: 'falsy' }).isISO8601(),
];

export const schemeIdParamValidation = [param('id').isMongoId().withMessage('Invalid scheme id')];

export const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('category').optional().isIn(SCHEME_CATEGORIES),
];
