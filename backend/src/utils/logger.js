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
  const prefix = `[${new Date().toISOString()}] ${level.toUpperCase()}`;
  // eslint-disable-next-line no-console -- this IS the console logging utility
  const sink = level === 'error' || level === 'fatal' ? console.error : console.log;
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
