import { env } from '../config/env.js';

/**
 * Minimal leveled logger over console. HTTP request logging is handled separately by
 * morgan in app.js; this covers app-level logs (boot, db connect, errors).
 */
const LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
const threshold = LEVELS.indexOf(env.LOG_LEVEL);

function shouldLog(level) {
  return LEVELS.indexOf(level) <= threshold;
}

function emit(level, args) {
  if (!shouldLog(level)) return;
  // eslint-disable-next-line no-console -- this IS the console logging utility
  const sink = level === 'error' || level === 'fatal' ? console.error : console.log;

  if (env.NODE_ENV === 'production') {
    // Structured single-line JSON for log aggregators (Grafana Loki, CloudWatch, etc.).
    const [message, ...rest] = args;
    const entry = { level, time: new Date().toISOString(), msg: String(message ?? '') };
    for (const part of rest) {
      if (part instanceof Error) {
        entry.error = { message: part.message, stack: part.stack };
      } else if (part && typeof part === 'object') {
        Object.assign(entry, part);
      } else {
        entry.detail = part;
      }
    }
    sink(JSON.stringify(entry));
    return;
  }

  const prefix = `[${new Date().toISOString()}] ${level.toUpperCase()}`;
  sink(prefix, ...args);
}

export const logger = {
  fatal: (...args) => emit('fatal', args),
  error: (...args) => emit('error', args),
  warn: (...args) => emit('warn', args),
  info: (...args) => emit('info', args),
  debug: (...args) => emit('debug', args),
  trace: (...args) => emit('trace', args),
};
