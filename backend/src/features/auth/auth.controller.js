import { successResponse } from '@dgp/shared';
import { asyncHandler } from '../../utils/async-handler.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerCitizen(req.body);
  res.status(201).json(successResponse(result));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginCitizen(req.body);
  res.status(200).json(successResponse(result));
});

export const officerLogin = asyncHandler(async (req, res) => {
  const result = await authService.loginOfficer(req.body);
  res.status(200).json(successResponse(result));
});

export const unifiedLogin = asyncHandler(async (req, res) => {
  const result = await authService.loginUnified(req.body);
  res.status(200).json(successResponse(result));
});

export const profile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.status(200).json(successResponse({ user }));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.status(200).json(successResponse({ user }));
});

/**
 * Stateless JWT: logout is a client-side token clear. The endpoint acknowledges so the
 * client has a consistent call to make; server holds no session to destroy (blueprint:
 * refresh-token/blacklist deferred to phase 2).
 */
export const logout = asyncHandler(async (_req, res) => {
  res.status(200).json(successResponse({ message: 'Logged out' }));
});
