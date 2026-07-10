import express from 'express';
import rateLimit from 'express-rate-limit';
import request from 'supertest';
import { errorResponse } from '@dgp/shared';
import { startTimer, measure } from '../../src/utils/performance.js';
import { reportError, setErrorReporter } from '../../src/utils/error-reporter.js';

describe('performance helpers', () => {
  test('startTimer returns non-negative elapsed milliseconds', async () => {
    const elapsed = startTimer();
    await new Promise((r) => setTimeout(r, 10));
    const ms = elapsed();
    expect(ms).toBeGreaterThan(0);
  });

  test('measure returns the result and elapsed time', async () => {
    const { result, ms } = await measure(async () => 42);
    expect(result).toBe(42);
    expect(typeof ms).toBe('number');
    expect(ms).toBeGreaterThanOrEqual(0);
  });

  test('measure attaches elapsed time to a thrown error', async () => {
    await expect(
      measure(async () => {
        throw new Error('boom');
      }),
    ).rejects.toMatchObject({ message: 'boom', ms: expect.any(Number) });
  });
});

describe('error-reporter abstraction', () => {
  test('routes reported errors to the configured sink and never throws', () => {
    const seen = [];
    setErrorReporter((err, ctx) => seen.push({ err, ctx }));
    reportError(new Error('kaboom'), { path: '/x' });
    expect(seen).toHaveLength(1);
    expect(seen[0].err.message).toBe('kaboom');
    expect(seen[0].ctx).toEqual({ path: '/x' });
    // A throwing sink must be swallowed.
    setErrorReporter(() => {
      throw new Error('sink failure');
    });
    expect(() => reportError(new Error('again'))).not.toThrow();
  });
});

describe('rate limiting returns a 429 envelope', () => {
  test('third request over the limit is blocked with the error envelope', async () => {
    const app = express();
    app.use(
      rateLimit({
        windowMs: 60_000,
        max: 2,
        standardHeaders: true,
        legacyHeaders: false,
        handler(_req, res) {
          res.status(429).json(errorResponse('RATE_LIMITED', 'Too many requests.'));
        },
      }),
    );
    app.get('/ping', (_req, res) => res.json({ success: true }));

    await request(app).get('/ping').expect(200);
    await request(app).get('/ping').expect(200);
    const res = await request(app).get('/ping');
    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('RATE_LIMITED');
  });
});
