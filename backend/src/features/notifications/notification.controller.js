import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import * as service from './notification.service.js';

// ---- Citizen / any authenticated user ----
export const listMine = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.listMine(req.user.id, req.query)));
});

export const unreadCount = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse({ unread: await service.unreadCount(req.user.id) }));
});

export const getMine = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.getMine(req.params.id, req.user.id)));
});

export const markRead = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.markRead(req.params.id, req.user.id)));
});

export const markAllRead = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.markAllRead(req.user.id)));
});

// ---- Officer ----
export const adminList = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.adminList(req.query)));
});

export const adminGetOne = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.adminGetOne(req.params.id)));
});

export const stats = asyncHandler(async (_req, res) => {
  res.status(200).json(successResponse(await service.stats()));
});

export const listBroadcasts = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.listBroadcasts(req.query)));
});

export const broadcastRecipients = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(successResponse(await service.broadcastRecipients(req.params.broadcastId, req.query)));
});

export const broadcast = asyncHandler(async (req, res) => {
  const result = await service.broadcast({ ...req.body, officerId: req.user.id });
  res.status(200).json(successResponse(result));
});

export const retry = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.retry(req.params.id, req.user.id)));
});
