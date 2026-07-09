/** Foundation vocabulary shared by backend + both frontends. Runtime value objects only. */

export const Role = {
  Citizen: 'citizen',
  Officer: 'officer',
};

export const Language = {
  English: 'en',
  Marathi: 'mr',
};

export const UserStatus = {
  Active: 'active',
  Inactive: 'inactive',
};

export const ComplaintCategory = {
  Road: 'Road',
  WaterSupply: 'WaterSupply',
  Sanitation: 'Sanitation',
  Electricity: 'Electricity',
  Other: 'Other',
};

export const ComplaintStatus = {
  Pending: 'Pending',
  InProgress: 'InProgress',
  Resolved: 'Resolved',
};

export const ComplaintPriority = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
};

export const NoticeChannel = {
  Sms: 'sms',
  Voice: 'voice',
};

export const TaxType = {
  Gharpatti: 'Gharpatti',
  PaniPatti: 'PaniPatti',
};

export const CertType = {
  Income: 'Income',
  Residence: 'Residence',
  Caste: 'Caste',
  Birth: 'Birth',
  Death: 'Death',
  Other: 'Other',
};

export const DakhalaStatus = {
  Submitted: 'Submitted',
  UnderReview: 'UnderReview',
  Approved: 'Approved',
  Rejected: 'Rejected',
};
