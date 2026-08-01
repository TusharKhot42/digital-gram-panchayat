import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import * as service from './poll.service.js';

/** GET /api/v1/polls — open polls; tallies hidden until this citizen has voted. */
export const publicList = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.publicList(req.user.id, req.query)));
});

export const vote = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(successResponse(await service.castVote(req.user.id, req.params.id, req.body.optionId)));
});

export const list = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.adminList(req.query)));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(successResponse(await service.createPoll(req.user.id, req.body)));
});

export const update = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(successResponse(await service.updatePoll(req.params.id, req.user.id, req.body)));
});

export const remove = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.deletePoll(req.params.id, req.user.id)));
});
