import { errorResponse } from '@dgp/shared';

export function notFoundMiddleware(req, res) {
  res
    .status(404)
    .json(errorResponse('NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`));
}
