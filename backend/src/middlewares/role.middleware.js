import { AppError } from '../utils/app-error.js';

/**
 * Gate a route to one or more roles. Must run after authenticate (needs req.user).
 * A citizen token hitting an officer-only route gets 403 (blueprint 4.2.2).
 * @param {...('citizen'|'officer')} roles
 */
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'FORBIDDEN', 'You do not have access to this resource'));
      return;
    }
    next();
  };
}
