import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import { listAudit } from './audit.service.js';

/** GET /api/v1/admin/audit — paginated, filterable, read-only audit trail. */
export const list = asyncHandler(async (req, res) => {
  const result = await listAudit(req.query);
  res.status(200).json(successResponse(result));
});
