import { AppError } from '../utils/app-error.js';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../features/auth/user.model.js';

/**
 * Verify the Bearer JWT, confirm the user still exists and is active, and attach
 * { id, role } to req.user. Rejects missing/invalid/expired tokens and deactivated
 * accounts (blueprint: deactivated user's token rejected on next request).
 */
export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const token = header.slice(7).trim();
    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new AppError(401, 'INVALID_TOKEN', 'Session expired, please log in again');
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new AppError(401, 'UNAUTHORIZED', 'Account is no longer active');
    }

    req.user = {
      id: user.id,
      role: user.role,
      ward: user.ward,
      isRootAdmin: Boolean(
        user.isRootAdmin ||
        (user.role === 'officer' &&
          user.email === (process.env.SEED_ADMIN_EMAIL || 'admin@dgp.local').toLowerCase()),
      ),
    };
    next();
  } catch (err) {
    next(err);
  }
}
