import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import * as dashboardService from './dashboard.service.js';

export const metrics = asyncHandler(async (_req, res) => {
  res.status(200).json(successResponse(await dashboardService.getMetrics()));
});

export const charts = asyncHandler(async (_req, res) => {
  res.status(200).json(successResponse(await dashboardService.getCharts()));
});

export const activity = asyncHandler(async (_req, res) => {
  res.status(200).json(successResponse(await dashboardService.getActivity()));
});

export const report = asyncHandler(async (_req, res) => {
  res.status(200).json(successResponse(await dashboardService.getReport()));
});
