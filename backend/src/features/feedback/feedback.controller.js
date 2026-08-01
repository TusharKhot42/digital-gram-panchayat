import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import * as service from './feedback.service.js';

export const submit = asyncHandler(async (req, res) => {
  res.status(201).json(successResponse(await service.submitFeedback(req.user.id, req.body)));
});

export const mine = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.myFeedback(req.user.id, req.query)));
});

/** GET /api/v1/feedback/summary — public per-service averages, no comments, no identities. */
export const summary = asyncHandler(async (_req, res) => {
  res.status(200).json(successResponse({ data: await service.publicSummary() }));
});

export const analytics = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.analytics(Number(req.query.months) || 6)));
});

export const list = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.adminList(req.query)));
});
