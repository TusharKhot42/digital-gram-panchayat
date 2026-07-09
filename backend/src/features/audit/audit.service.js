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
