import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import { getPublicProfile, updateProfile } from './village.service.js';

/** GET /api/v1/village — public village profile (no auth). */
export const getPublic = asyncHandler(async (_req, res) => {
  res.status(200).json(successResponse(await getPublicProfile()));
});

/** PUT /api/v1/admin/village — officer edit (partial sections + optional logo/banner). */
export const update = asyncHandler(async (req, res) => {
  const profile = await updateProfile(req.user.id, req.body, req.files);
  res.status(200).json(successResponse(profile));
});
