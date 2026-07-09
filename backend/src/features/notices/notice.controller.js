import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import * as noticeService from './notice.service.js';

// ---- Public (no auth) ----
export const publicList = asyncHandler(async (req, res) => {
  const result = await noticeService.publicList(req.query);
  res.status(200).json(successResponse(result));
});

export const publicDetail = asyncHandler(async (req, res) => {
  const notice = await noticeService.publicDetail(req.params.id);
  res.status(200).json(successResponse(notice));
});

// ---- Officer ----
export const create = asyncHandler(async (req, res) => {
  const notice = await noticeService.createNotice({
    officerId: req.user.id,
    body: req.body,
    file: req.file,
  });
  res.status(201).json(successResponse(notice));
});

export const adminList = asyncHandler(async (req, res) => {
  const result = await noticeService.adminList(req.query);
  res.status(200).json(successResponse(result));
});

export const adminGetOne = asyncHandler(async (req, res) => {
  const notice = await noticeService.adminGetOne(req.params.id);
  res.status(200).json(successResponse(notice));
});

export const update = asyncHandler(async (req, res) => {
  const notice = await noticeService.updateNotice(req.params.id, req.user.id, req.body, req.file);
  res.status(200).json(successResponse(notice));
});

export const publish = asyncHandler(async (req, res) => {
  const notice = await noticeService.publishNotice(req.params.id, req.user.id);
  res.status(200).json(successResponse(notice));
});

export const archive = asyncHandler(async (req, res) => {
  const notice = await noticeService.archiveNotice(req.params.id, req.user.id);
  res.status(200).json(successResponse(notice));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await noticeService.deleteNotice(req.params.id, req.user.id);
  res.status(200).json(successResponse(result));
});

export const broadcast = asyncHandler(async (req, res) => {
  const result = await noticeService.broadcast(req.params.id, req.user.id, req.body);
  res.status(200).json(successResponse(result));
});
