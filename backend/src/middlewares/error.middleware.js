import { ZodError } from 'zod';
import { errorResponse } from '@dgp/shared';
import { AppError } from '../utils/app-error.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorMiddleware(err, req, res, _next) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.code, err.message, err.fields));
    return;
  }

  if (err instanceof ZodError) {
    const fields = {};
    for (const issue of err.issues) {
      fields[issue.path.join('.') || 'value'] = issue.message;
    }
    res.status(400).json(errorResponse('VALIDATION_ERROR', 'Invalid request', fields));
    return;
  }

  const error = err instanceof Error ? err : new Error('Unknown error');
  logger.error('Unhandled error', { path: req.path, method: req.method }, error);

  res
    .status(500)
    .json(
      errorResponse(
        'INTERNAL_ERROR',
        env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
      ),
    );
}
