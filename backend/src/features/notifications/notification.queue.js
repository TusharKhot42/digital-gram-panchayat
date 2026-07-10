import { logger } from '../../utils/logger.js';

/**
 * Notification delivery queue — a thin abstraction so business modules and the service
 * never block on provider I/O and are queue-ready. Today it runs the handler in-process;
 * swapping to BullMQ/RabbitMQ later means reimplementing `enqueue` to push a job onto the
 * broker and running `process` in a worker — no caller changes.
 *
 * In development/test the job runs synchronously (awaited) so behaviour is deterministic;
 * in production it is dispatched on the next tick so the request returns immediately.
 */
let handler = null;

/** Register the worker that processes a job payload. */
export function setQueueHandler(fn) {
  handler = fn;
}

/**
 * @param {{ notificationId: string }} job
 * @param {{ sync?: boolean }} [opts]
 */
export async function enqueue(job, opts = {}) {
  if (!handler) {
    logger.warn('Notification queue has no handler registered');
    return;
  }
  if (opts.sync) {
    await handler(job);
    return;
  }
  // Fire-and-forget on the next tick (queue-ready seam for a real broker).
  setImmediate(() => {
    Promise.resolve(handler(job)).catch((err) => logger.error('Notification job failed', err));
  });
}
