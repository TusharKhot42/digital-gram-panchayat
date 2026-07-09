import { body, param, query } from 'express-validator';
import { NOTICE_CATEGORIES, SMS_SUMMARY_MAX_LENGTH } from '@dgp/shared';

export const createNoticeValidation = [
  body('title').trim().isLength({ min: 3, max: 160 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 5, max: 10000 }).withMessage('Content is required'),
  body('summary')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: SMS_SUMMARY_MAX_LENGTH })
    .withMessage(`Summary must be ${SMS_SUMMARY_MAX_LENGTH} characters or fewer`),
  body('category')
    .optional({ values: 'falsy' })
    .isIn(NOTICE_CATEGORIES)
    .withMessage('Invalid category'),
  body('publishDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid publish date'),
  body('expiryDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid expiry date'),
];

export const updateNoticeValidation = [
  param('id').isMongoId().withMessage('Invalid notice id'),
  body('title').optional({ values: 'falsy' }).trim().isLength({ min: 3, max: 160 }),
  body('content').optional({ values: 'falsy' }).trim().isLength({ min: 5, max: 10000 }),
  body('summary').optional({ values: 'falsy' }).trim().isLength({ max: SMS_SUMMARY_MAX_LENGTH }),
  body('category').optional({ values: 'falsy' }).isIn(NOTICE_CATEGORIES),
  body('publishDate').optional({ values: 'falsy' }).isISO8601(),
  body('expiryDate').optional({ values: 'falsy' }).isISO8601(),
];

export const noticeIdParamValidation = [param('id').isMongoId().withMessage('Invalid notice id')];

export const broadcastValidation = [
  param('id').isMongoId().withMessage('Invalid notice id'),
  body('summary')
    .trim()
    .isLength({ min: 1, max: SMS_SUMMARY_MAX_LENGTH })
    .withMessage(`Summary is required and must be ${SMS_SUMMARY_MAX_LENGTH} characters or fewer`),
  body().custom((value) => {
    if (!value.sms && !value.voice) {
      throw new Error('Choose at least one channel (SMS or voice)');
    }
    return true;
  }),
];

export const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('category').optional().isIn(NOTICE_CATEGORIES),
];
