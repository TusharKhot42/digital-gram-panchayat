import { apiClient } from '@/services/api-client';

export const complaintService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/admin/complaints', { params });
    return data.data; // { data, total, page, limit }
  },

  async getOne(id) {
    const { data } = await apiClient.get(`/admin/complaints/${id}`);
    return data.data;
  },

  async updateStatus(id, payload) {
    const { data } = await apiClient.patch(`/admin/complaints/${id}/status`, payload);
    return data.data;
  },
};
