import rateLimit from 'express-rate-limit';
import { errorResponse } from '@dgp/shared';
import { env } from '../config/env.js';

// Rate limiting applies in production only. The integration suites must not be throttled, and
// an ordinary local session — HMR reloads plus several public data fetches per page view —
// otherwise exhausts the app-wide ceiling and surfaces "Too many requests" on the login and
// welcome screens. Production keeps every limit exactly as configured.
const LIMITS_DISABLED = env.NODE_ENV !== 'production';

/**
 * Build a rate limiter that returns our uniform error envelope on 429. Skipped outside
 * production; the limiter's behaviour is covered by a dedicated test that constructs its own
 * instance with an explicit skip override.
 *
 * @param {{ windowMs?: number, max: number, code?: string, message?: string }} opts
 */
export function createRateLimiter({
  windowMs = env.RATE_LIMIT_WINDOW_MS,
  max,
  code,
  message,
  keyGenerator,
}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    ...(keyGenerator ? { keyGenerator } : {}),
    skip: () => LIMITS_DISABLED,
    handler(_req, res) {
      res
        .status(429)
        .json(
          errorResponse(
            code || 'RATE_LIMITED',
            message || 'Too many requests. Please try again later.',
          ),
        );
    },
  });
}

// Authentication (login/register/lookup) — very strict; blunts credential stuffing.
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  code: 'AUTH_RATE_LIMITED',
  message: 'Too many attempts. Please wait a few minutes and try again.',
});

/**
 * Per-account login throttle, layered on top of the IP-based authLimiter. Keys by the
 * submitted identifier (mobile/email) as well as the IP, so a single account can't be
 * brute-forced even from rotating IPs, and one IP can't spray many accounts. Falls back to
 * IP-only when no identifier is present. Runs after body parsing, so req.body is available.
 */
export const loginThrottle = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  code: 'AUTH_RATE_LIMITED',
  message: 'Too many attempts for this account. Please wait a few minutes and try again.',
  keyGenerator(req) {
    const id = req.body?.identifier || req.body?.email || req.body?.mobile || '';
    return `${req.ip}:${String(id).toLowerCase()}`;
  },
});

// Complaint submission — medium.
export const complaintLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  code: 'COMPLAINT_RATE_LIMITED',
  message: 'You have filed many complaints recently. Please try again later.',
});

// Certificate application — medium.
export const certificateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  code: 'CERTIFICATE_RATE_LIMITED',
  message: 'You have submitted many applications recently. Please try again later.',
});

// Broadcast notification — strict (fans out SMS/voice to many recipients).
export const broadcastLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  code: 'BROADCAST_RATE_LIMITED',
  message: 'Too many broadcasts. Please wait before sending another.',
});

// General API traffic — standard ceiling applied app-wide.
export const generalLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
});
