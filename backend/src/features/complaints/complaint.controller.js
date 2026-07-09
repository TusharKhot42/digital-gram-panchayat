import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import * as complaintService from './complaint.service.js';

export const create = asyncHandler(async (req, res) => {
  const complaint = await complaintService.createComplaint({
    citizenId: req.user.id,
    body: req.body,
    files: req.files,
  });
  res.status(201).json(successResponse(complaint));
});

export const listMine = asyncHandler(async (req, res) => {
  const result = await complaintService.listMine(req.user.id, req.query);
  res.status(200).json(successResponse(result));
});

export const getOne = asyncHandler(async (req, res) => {
  const complaint = await complaintService.getOne(req.params.id, req.user);
  res.status(200).json(successResponse(complaint));
});

export const adminList = asyncHandler(async (req, res) => {
  const result = await complaintService.adminList(req.query);
  res.status(200).json(successResponse(result));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const complaint = await complaintService.updateStatus(req.params.id, req.user, req.body);
  res.status(200).json(successResponse(complaint));
});
