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

export const COMPLAINT_STATUSES = ['Pending', 'InProgress', 'Resolved'];

export const COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High'];

export const NOTICE_CATEGORIES = [
  'General',
  'WaterSupply',
  'Electricity',
  'Health',
  'Event',
  'Emergency',
  'Tax',
  'Other',
];

export const BROADCAST_CHANNELS = ['sms', 'voice'];

// SMS body cap for broadcast summaries (blueprint 5.3).
export const SMS_SUMMARY_MAX_LENGTH = 160;

export const ATTACHMENT_TYPES = ['pdf', 'image'];

export const SCHEME_CATEGORIES = [
  'Agriculture',
  'Health',
  'Education',
  'Housing',
  'Employment',
  'Women',
  'SeniorCitizen',
  'Financial',
  'Other',
];

export const TAX_TYPES = ['Property', 'Water'];

export const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid'];

export const PAYMENT_STATUS_COLOR_MAP = {
  Unpaid: 'red',
  Partial: 'orange',
  Paid: 'green',
};

export const CERT_TYPES = ['Residence', 'Income', 'Birth', 'Death', 'Character', 'Other'];

export const DAKHALA_STATUSES = ['Submitted', 'UnderReview', 'Approved', 'Rejected'];

export const DAKHALA_STATUS_COLOR_MAP = {
  Submitted: 'red',
  UnderReview: 'orange',
  Approved: 'green',
  Rejected: 'grey',
};

// Dynamic per-type application fields. Backend validates required keys against these;
// the citizen form renders inputs from the same map (single source).
export const CERT_TYPE_FIELDS = {
  Residence: [
    { key: 'fullName', label: 'Full name', type: 'text', required: true },
    { key: 'address', label: 'Residential address', type: 'textarea', required: true },
    { key: 'yearsOfResidence', label: 'Years of residence', type: 'number', required: true },
    { key: 'purpose', label: 'Purpose', type: 'text', required: true },
  ],
  Income: [
    { key: 'fullName', label: 'Full name', type: 'text', required: true },
    { key: 'annualIncome', label: 'Annual income (₹)', type: 'number', required: true },
    { key: 'occupation', label: 'Occupation', type: 'text', required: true },
    { key: 'purpose', label: 'Purpose', type: 'text', required: true },
  ],
  Birth: [
    { key: 'childName', label: 'Child name', type: 'text', required: true },
    { key: 'dateOfBirth', label: 'Date of birth', type: 'date', required: true },
    { key: 'placeOfBirth', label: 'Place of birth', type: 'text', required: true },
    { key: 'fatherName', label: "Father's name", type: 'text', required: true },
    { key: 'motherName', label: "Mother's name", type: 'text', required: true },
  ],
  Death: [
    { key: 'deceasedName', label: 'Name of deceased', type: 'text', required: true },
    { key: 'dateOfDeath', label: 'Date of death', type: 'date', required: true },
    { key: 'placeOfDeath', label: 'Place of death', type: 'text', required: true },
    { key: 'relationToApplicant', label: 'Relation to applicant', type: 'text', required: true },
  ],
  Character: [
    { key: 'fullName', label: 'Full name', type: 'text', required: true },
    { key: 'purpose', label: 'Purpose', type: 'text', required: true },
  ],
  Other: [
    { key: 'fullName', label: 'Full name', type: 'text', required: true },
    { key: 'details', label: 'Details', type: 'textarea', required: true },
    { key: 'purpose', label: 'Purpose', type: 'text', required: true },
  ],
};

export const MAX_CERT_DOCUMENTS = 5;

// Chart palette for the officer dashboard (recharts).
export const CHART_COLORS = ['#15803d', '#f97316', '#ef4444', '#3b82f6', '#a855f7', '#64748b'];

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
