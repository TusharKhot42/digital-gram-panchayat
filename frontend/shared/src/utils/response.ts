import type { ApiErrorResponse, ApiSuccessResponse } from '../types/api.js';

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data };
}

export function errorResponse(
  code: string,
  message: string,
  fields?: Record<string, string>,
): ApiErrorResponse {
  return { success: false, error: { code, message, ...(fields ? { fields } : {}) } };
}
