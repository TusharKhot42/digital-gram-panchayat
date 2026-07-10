import { ZodError } from 'zod';
import { errorResponse } from '@dgp/shared';
import { AppError } from '../utils/app-error.js';
import { reportError } from '../utils/error-reporter.js';
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

  // Mongo duplicate key (e.g. mobile/email already registered) -> 409, no stack leak.
  if (err && err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    res.status(409).json(
      errorResponse('DUPLICATE_KEY', `This ${field} is already registered`, {
        [field]: 'Already in use',
      }),
    );
    return;
  }

  const error = err instanceof Error ? err : new Error('Unknown error');
  reportError(error, { path: req.path, method: req.method });

  res
    .status(500)
    .json(
      errorResponse(
        'INTERNAL_ERROR',
        env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
      ),
    );
}
