import mongoose from 'mongoose';
import { successResponse, errorResponse } from '@dgp/shared';
import { env } from '../../config/env.js';
import { renderPrometheus } from '../../utils/metrics.js';

/** General health snapshot (uptime + build info + db state). */
export function getHealth(_req, res) {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(200).json(
    successResponse({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: env.API_VERSION,
      db: dbConnected ? 'connected' : 'disconnected',
    }),
  );
}

/** Liveness — the process is up and the event loop responsive. Never touches dependencies. */
export function getLiveness(_req, res) {
  res.status(200).json(successResponse({ status: 'alive', uptime: process.uptime() }));
}

/**
 * Readiness — safe to receive traffic only when the database is connected. Returns 503 so an
 * orchestrator (Render / K8s) holds traffic until MongoDB is reachable.
 */
export function getReadiness(_req, res) {
  const ready = mongoose.connection.readyState === 1;
  if (ready) {
    res.status(200).json(successResponse({ status: 'ready', db: 'connected' }));
    return;
  }
  res.status(503).json(errorResponse('NOT_READY', 'Database not connected'));
}

/** Prometheus text-exposition metrics for scraping (Grafana / Prometheus). */
export function getMetrics(_req, res) {
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.status(200).send(renderPrometheus());
}
