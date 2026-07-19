import { PAGINATION_DEFAULTS } from '@dgp/shared';
import { AuditLog } from './audit.model.js';
import { logger } from '../../utils/logger.js';

/**
 * Write an audit entry. Non-blocking by design: a failed audit write must never break
 * the user-facing action, so errors are logged and swallowed.
 * @param {{ actorId?: string, actorRole: 'citizen'|'officer'|'system', action: string,
 *           entity: string, entityId?: string, before?: object, after?: object }} entry
 */
export async function writeAudit(entry) {
  try {
    await AuditLog.create({ ...entry, at: new Date() });
  } catch (err) {
    logger.error('Audit write failed', err);
  }
}

/**
 * Read the audit trail, newest first, with optional filters. Read-only — the log stays
 * append-only. `actor` is resolved to a display name for the viewer.
 *
 * @param {{ page?: number, limit?: number, entity?: string, action?: string,
 *           actorRole?: string }} query
 */
export async function listAudit(query = {}) {
  const page = Math.max(1, Number(query.page) || PAGINATION_DEFAULTS.page);
  const limit = Math.min(
    PAGINATION_DEFAULTS.maxLimit,
    Math.max(1, Number(query.limit) || PAGINATION_DEFAULTS.limit),
  );

  const filter = {};
  if (query.entity) filter.entity = query.entity;
  if (query.actorRole) filter.actorRole = query.actorRole;
  // `action` is a prefix filter (e.g. "scheme" matches scheme.create/update/…).
  if (query.action)
    filter.action = new RegExp(`^${String(query.action).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

  const [rows, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actorId', 'fullName email')
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  const data = rows.map((r) => ({
    id: String(r._id),
    action: r.action,
    entity: r.entity,
    entityId: r.entityId ? String(r.entityId) : null,
    actorName: r.actorId?.fullName || (r.actorRole === 'system' ? 'System' : '—'),
    actorRole: r.actorRole,
    at: r.at,
  }));

  return { data, page, limit, total };
}
