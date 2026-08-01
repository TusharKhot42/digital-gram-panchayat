import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import * as service from './meeting.service.js';

/** GET /api/v1/meetings — published meetings, live and upcoming first. */
export const publicList = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.publicList(req.query)));
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
    .json(successResponse(await service.createMeeting(req.user.id, req.body, req.files)));
});

export const update = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      successResponse(await service.updateMeeting(req.params.id, req.user.id, req.body, req.files)),
    );
});

export const remove = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.deleteMeeting(req.params.id, req.user.id)));
});
