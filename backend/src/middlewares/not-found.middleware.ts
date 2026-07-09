import type { Request, Response } from 'express';
import { errorResponse } from '@dgp/shared';

export function notFoundMiddleware(req: Request, res: Response): void {
  res
    .status(404)
    .json(errorResponse('NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`));
}
