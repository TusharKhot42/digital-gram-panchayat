import type { Request, Response } from 'express';
import { successResponse, type HealthStatus } from '@dgp/shared';
import { env } from '../../config/env.js';

export function getHealth(_req: Request, res: Response): void {
  const payload: HealthStatus = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: env.API_VERSION,
  };
  res.status(200).json(successResponse(payload));
}
