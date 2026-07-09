/** Uniform API envelope — every backend response and every frontend consumer agree on this shape. */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedData<T> extends PaginationMeta {
  data: T[];
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

export interface HealthStatus {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
  environment: string;
  version: string;
}
