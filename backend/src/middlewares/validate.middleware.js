import { validationResult } from 'express-validator';
import { errorResponse } from '@dgp/shared';

/**
 * Terminal middleware after a set of express-validator chains. Collects any errors
 * into the uniform { success:false, error:{ code, message, fields } } envelope.
 */
export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  const fields = {};
  for (const err of result.array()) {
    const key = err.path || err.param || 'value';
    if (!fields[key]) fields[key] = err.msg;
  }

  res.status(400).json(errorResponse('VALIDATION_ERROR', 'Invalid request', fields));
}
