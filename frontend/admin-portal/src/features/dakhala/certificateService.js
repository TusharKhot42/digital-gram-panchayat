import { apiClient } from '@/services/api-client';

export const certificateService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/admin/dakhala', { params });
    return data.data;
  },
  async getOne(id) {
    const { data } = await apiClient.get(`/admin/dakhala/${id}`);
    return data.data;
  },
  async review(id) {
    const { data } = await apiClient.patch(`/admin/dakhala/${id}/review`);
    return data.data;
  },
  async approve(id, edits = {}) {
    // edits: optional { applicationData, officerRemarks } applied before the certificate is
    // generated. Omitting it keeps the original behaviour (approve with no changes).
    const { data } = await apiClient.patch(`/admin/dakhala/${id}/approve`, edits);
    return data.data;
  },
  async reject(id, reason) {
    const { data } = await apiClient.patch(`/admin/dakhala/${id}/reject`, { reason });
    return data.data;
  },
};
