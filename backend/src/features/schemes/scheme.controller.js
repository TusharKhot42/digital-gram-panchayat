import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import * as schemeService from './scheme.service.js';

// ---- Public ----
export const publicList = asyncHandler(async (req, res) => {
  const result = await schemeService.publicList(req.query);
  res.status(200).json(successResponse(result));
});

export const publicDetail = asyncHandler(async (req, res) => {
  const scheme = await schemeService.publicDetail(req.params.id);
  res.status(200).json(successResponse(scheme));
});

// ---- Officer ----
export const create = asyncHandler(async (req, res) => {
  const scheme = await schemeService.createScheme({
    officerId: req.user.id,
    body: req.body,
    files: req.files,
  });
  res.status(201).json(successResponse(scheme));
});

export const adminList = asyncHandler(async (req, res) => {
  const result = await schemeService.adminList(req.query);
  res.status(200).json(successResponse(result));
});

export const adminGetOne = asyncHandler(async (req, res) => {
  const scheme = await schemeService.adminGetOne(req.params.id);
  res.status(200).json(successResponse(scheme));
});

export const update = asyncHandler(async (req, res) => {
  const scheme = await schemeService.updateScheme(req.params.id, req.user.id, req.body, req.files);
  res.status(200).json(successResponse(scheme));
});

export const publish = asyncHandler(async (req, res) => {
  const scheme = await schemeService.publishScheme(req.params.id, req.user.id);
  res.status(200).json(successResponse(scheme));
});

export const unpublish = asyncHandler(async (req, res) => {
  const scheme = await schemeService.unpublishScheme(req.params.id, req.user.id);
  res.status(200).json(successResponse(scheme));
});

export const remove = asyncHandler(async (req, res) => {
  const result = await schemeService.deleteScheme(req.params.id, req.user.id);
  res.status(200).json(successResponse(result));
});
