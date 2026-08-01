import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import * as service from './project.service.js';

export const publicList = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.publicList(req.query)));
});

/** GET /api/v1/projects/summary — village-wide budget and completion totals. */
export const publicSummary = asyncHandler(async (_req, res) => {
  res.status(200).json(successResponse(await service.publicSummary()));
});

export const publicDetail = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.publicDetail(req.params.id)));
});

export const list = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.adminList(req.query)));
});

export const detail = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.adminDetail(req.params.id)));
});

export const create = asyncHandler(async (req, res) => {
  res
    .status(201)
    .json(successResponse(await service.createProject(req.user.id, req.body, req.files)));
});

export const update = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      successResponse(await service.updateProject(req.params.id, req.user.id, req.body, req.files)),
    );
});

export const remove = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.deleteProject(req.params.id, req.user.id)));
});
