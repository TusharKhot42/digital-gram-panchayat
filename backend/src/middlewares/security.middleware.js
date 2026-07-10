import helmet from 'helmet';
import cors from 'cors';
import { IDEMPOTENCY_HEADER } from '@dgp/shared';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

/**
 * Helmet tuned for a JSON API (no HTML is served from here, so CSP is unnecessary and would
 * only risk breaking clients). HSTS is enabled in production; images/attachments live on a
 * CDN, so cross-origin resource sharing is allowed.
 */
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: env.NODE_ENV === 'production',
  });
}

/**
 * Strict CORS allowlist. Only the two known frontends may call the API from a browser.
 * Requests with no Origin (same-origin, curl, native apps, tests) are allowed through.
 */
export function strictCors() {
  const allowlist = new Set([env.CORS_ORIGIN_CITIZEN, env.CORS_ORIGIN_ADMIN]);
  return cors({
    origin(origin, callback) {
      if (!origin || allowlist.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new AppError(403, 'CORS_FORBIDDEN', 'Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', IDEMPOTENCY_HEADER],
    maxAge: 600,
  });
}

/**
 * API responses carry citizen/officer data — instruct browsers and shared caches never to
 * store them. (The PWA's service worker caches selectively via Workbox regardless.)
 */
export function noStore(_req, res, next) {
  res.set('Cache-Control', 'no-store');
  next();
}
