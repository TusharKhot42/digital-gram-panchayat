import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import * as service from './event.service.js';

/** GET /api/v1/events — public upcoming events. */
export const publicList = asyncHandler(async (_req, res) => {
  res.status(200).json(successResponse({ data: await service.publicUpcoming() }));
});

/** GET /api/v1/admin/events — officer list. */
export const list = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.adminList(req.query)));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(successResponse(await service.createEvent(req.user.id, req.body, req.file)));
});

export const update = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      successResponse(await service.updateEvent(req.params.id, req.user.id, req.body, req.file)),
    );
});

export const remove = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.deleteEvent(req.params.id, req.user.id)));
});
