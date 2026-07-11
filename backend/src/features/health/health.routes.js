import { Router } from 'express';
import { getHealth, getLiveness, getReadiness, getMetrics } from './health.controller.js';

// Mounted at /api/v1/health. Liveness/readiness are separate so orchestrators can probe them
// independently (liveness = restart if failing; readiness = hold traffic if failing).
export const healthRouter = Router();

healthRouter.get('/', getHealth);
healthRouter.get('/live', getLiveness);
healthRouter.get('/ready', getReadiness);
healthRouter.get('/metrics', getMetrics);
