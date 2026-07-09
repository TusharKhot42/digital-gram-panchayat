export const APP_NAME = 'Digital Gram Panchayat';
export const APP_SHORT_NAME = 'DGP';

export const API_VERSION = 'v1';

export const SUPPORTED_LANGUAGES = ['en', 'mr'] as const;
export const DEFAULT_LANGUAGE = 'mr';

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

export const COMPLAINT_CATEGORIES = [
  'Road',
  'WaterSupply',
  'Sanitation',
  'Electricity',
  'Other',
] as const;

export const CERT_TYPES = ['Income', 'Residence', 'Caste', 'Birth', 'Death', 'Other'] as const;

export const STATUS_COLOR_MAP: Record<string, string> = {
  Pending: 'red',
  Submitted: 'red',
  InProgress: 'orange',
  UnderReview: 'orange',
  Resolved: 'green',
  Approved: 'green',
  Rejected: 'grey',
};

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, per SRS 4.2.1
export const MAX_COMPLAINT_PHOTOS = 3;
