import { ROLES, PAGINATION_DEFAULTS } from '@dgp/shared';
import { User } from '../auth/user.model.js';
import { AppError } from '../../utils/app-error.js';
import { writeAudit } from '../audit/audit.service.js';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Officer user list with search / role+status filter / pagination.
 * @param {object} query
 */
export async function listUsers(query) {
  const page = query.page || PAGINATION_DEFAULTS.page;
  const limit = query.limit || PAGINATION_DEFAULTS.limit;

  const filter = {};
  // Default to citizens (officers manage citizen accounts, blueprint 5.7).
  filter.role = query.role || ROLES.CITIZEN;
  // Account state is stored as the boolean isActive; the API exposes active|inactive.
  if (query.status) filter.isActive = query.status === 'active';
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [{ fullName: rx }, { mobile: rx }, { email: rx }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);
  return { data: items.map((u) => u.toJSON()), total, page, limit };
}

/** @param {string} id */
export async function getUser(id) {
  const user = await User.findById(id).catch(() => null);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  return user.toJSON();
}

/**
 * Activate/deactivate a user. An officer cannot deactivate their own account.
 * A deactivated user's token is rejected on the next request (auth middleware).
 * @param {string} id @param {string} officerId @param {'active'|'inactive'} status
 */
export async function setStatus(id, officerId, status) {
  if (String(id) === String(officerId) && status === 'inactive') {
    throw new AppError(400, 'CANNOT_SELF_DEACTIVATE', 'You cannot deactivate your own account');
  }
  const user = await User.findById(id).catch(() => null);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

  const before = { isActive: user.isActive };
  user.isActive = status === 'active';
  await user.save();

  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action: 'user.status.update',
    entity: 'users',
    entityId: user.id,
    before,
    after: { isActive: user.isActive },
  });

  return user.toJSON();
}
