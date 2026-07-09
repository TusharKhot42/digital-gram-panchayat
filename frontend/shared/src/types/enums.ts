/** Foundation vocabulary shared by backend + both frontends. No business logic — values only. */

export const Role = {
  Citizen: 'citizen',
  Officer: 'officer',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Language = {
  English: 'en',
  Marathi: 'mr',
} as const;
export type Language = (typeof Language)[keyof typeof Language];

export const UserStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const ComplaintCategory = {
  Road: 'Road',
  WaterSupply: 'WaterSupply',
  Sanitation: 'Sanitation',
  Electricity: 'Electricity',
  Other: 'Other',
} as const;
export type ComplaintCategory = (typeof ComplaintCategory)[keyof typeof ComplaintCategory];

export const ComplaintStatus = {
  Pending: 'Pending',
  InProgress: 'InProgress',
  Resolved: 'Resolved',
} as const;
export type ComplaintStatus = (typeof ComplaintStatus)[keyof typeof ComplaintStatus];

export const NoticeChannel = {
  Sms: 'sms',
  Voice: 'voice',
} as const;
export type NoticeChannel = (typeof NoticeChannel)[keyof typeof NoticeChannel];

export const TaxType = {
  Gharpatti: 'Gharpatti',
  PaniPatti: 'PaniPatti',
} as const;
export type TaxType = (typeof TaxType)[keyof typeof TaxType];

export const CertType = {
  Income: 'Income',
  Residence: 'Residence',
  Caste: 'Caste',
  Birth: 'Birth',
  Death: 'Death',
  Other: 'Other',
} as const;
export type CertType = (typeof CertType)[keyof typeof CertType];

export const DakhalaStatus = {
  Submitted: 'Submitted',
  UnderReview: 'UnderReview',
  Approved: 'Approved',
  Rejected: 'Rejected',
} as const;
export type DakhalaStatus = (typeof DakhalaStatus)[keyof typeof DakhalaStatus];
