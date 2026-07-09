/**
 * Wrap an async route handler so rejected promises flow to the error middleware
 * instead of crashing the process. Keeps controllers free of try/catch boilerplate.
 * @param {Function} fn
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
