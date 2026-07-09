export const APP_NAME = 'Digital Gram Panchayat';
export const APP_SHORT_NAME = 'DGP';

export const API_VERSION = 'v1';

export const SUPPORTED_LANGUAGES = ['en', 'mr'];
export const DEFAULT_LANGUAGE = 'mr';

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
};

export const COMPLAINT_CATEGORIES = ['Road', 'WaterSupply', 'Sanitation', 'Electricity', 'Other'];

export const CERT_TYPES = ['Income', 'Residence', 'Caste', 'Birth', 'Death', 'Other'];

export const STATUS_COLOR_MAP = {
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

// ---- Auth ----
// Role values match the Role enum (citizen | officer). The admin portal authenticates
// officers; "admin" in route paths is cosmetic, the token role claim is 'officer'.
export const ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
};

export const TOKEN_STORAGE_KEY = 'dgp_token';
export const USER_STORAGE_KEY = 'dgp_user';
export const ADMIN_TOKEN_STORAGE_KEY = 'dgp_admin_token';
export const ADMIN_USER_STORAGE_KEY = 'dgp_admin_user';

// Field rules — single source shared by frontend RHF validation + backend express-validator.
export const VALIDATION = {
  MOBILE_REGEX: /^[6-9]\d{9}$/,
  MOBILE_MESSAGE: 'Enter a valid 10-digit Indian mobile number',
  PASSWORD_MIN_LENGTH: 6,
  FULLNAME_MIN_LENGTH: 2,
  FULLNAME_MAX_LENGTH: 100,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
