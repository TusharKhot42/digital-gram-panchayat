import { startTimer } from '../utils/performance.js';
import { logger } from '../utils/logger.js';
import { incrementCounter, observeRequestDuration } from '../utils/metrics.js';

// Requests slower than this are logged at warn level so slow endpoints surface in prod logs.
const SLOW_REQUEST_MS = 1000;

/**
 * Times every request, sets an `X-Response-Time` header, logs method/path/status/duration, and
 * feeds the metrics registry. Complements morgan (which logs the HTTP line) with a structured,
 * threshold-aware record plus Prometheus-scrapable counters/histogram.
 */
export function requestTiming(req, res, next) {
  const elapsed = startTimer();
  res.on('finish', () => {
    const ms = elapsed();
    const line = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      ms: Math.round(ms),
    };
    observeRequestDuration(ms);
    incrementCounter('http_requests_total');
    incrementCounter(`http_responses_${Math.floor(res.statusCode / 100)}xx_total`);
    if (ms >= SLOW_REQUEST_MS) logger.warn('Slow request', line);
    else logger.debug('Request', line);
  });
  // Header must be set before the body is sent.
  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = (...args) => {
    if (!res.headersSent) res.set('X-Response-Time', `${Math.round(elapsed())}ms`);
    return originalWriteHead(...args);
  };
  next();
}
