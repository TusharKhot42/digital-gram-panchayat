import { logger } from './logger.js';

/**
 * Provider-agnostic error reporting. The default sink logs via the app logger; a real
 * provider (Sentry, Datadog, …) can be wired later through `setErrorReporter` without
 * touching call sites. Intentionally no Sentry dependency yet.
 *
 * @type {(error: Error, context?: Record<string, unknown>) => void}
 */
let sink = (error, context) => {
  logger.error('Reported error', context || {}, error);
};

/** Swap the reporting sink (e.g. to forward to an external service). */
export function setErrorReporter(fn) {
  sink = typeof fn === 'function' ? fn : sink;
}

/** Report an unexpected error with optional structured context. Never throws. */
export function reportError(error, context) {
  try {
    sink(error instanceof Error ? error : new Error(String(error)), context);
  } catch {
    // Reporting must never break the request path.
  }
}
