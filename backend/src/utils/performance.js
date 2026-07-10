/**
 * Tiny performance-timing helpers built on the high-resolution monotonic clock. Provider-
 * agnostic — callers decide what to do with the elapsed milliseconds (log, report, header).
 */

/** Start a timer. Returns a function that yields elapsed milliseconds when called. */
export function startTimer() {
  const begin = process.hrtime.bigint();
  return () => Number(process.hrtime.bigint() - begin) / 1e6;
}

/**
 * Measure an async operation. Returns `{ result, ms }`. Never swallows errors — on throw the
 * elapsed time is attached to the error as `err.ms` so callers can still record slow failures.
 * @template T
 * @param {() => Promise<T>} fn
 */
export async function measure(fn) {
  const elapsed = startTimer();
  try {
    const result = await fn();
    return { result, ms: elapsed() };
  } catch (err) {
    if (err && typeof err === 'object') err.ms = elapsed();
    throw err;
  }
}
