import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import * as service from './download.service.js';

export const publicList = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.publicList(req.query)));
});

/** POST /api/v1/downloads/:id/open — count the download, return the file URL. */
export const open = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.registerDownload(req.params.id)));
});

export const list = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.adminList(req.query)));
});

export const create = asyncHandler(async (req, res) => {
  res
    .status(201)
    .json(successResponse(await service.createDocument(req.user.id, req.body, req.file)));
});

export const update = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      successResponse(await service.updateDocument(req.params.id, req.user.id, req.body, req.file)),
    );
});

export const remove = asyncHandler(async (req, res) => {
  res.status(200).json(successResponse(await service.deleteDocument(req.params.id, req.user.id)));
});
