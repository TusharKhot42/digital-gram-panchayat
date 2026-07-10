import { apiClient } from '@/services/api-client';

export const userService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/admin/users', { params });
    return data.data;
  },
  async getOne(id) {
    const { data } = await apiClient.get(`/admin/users/${id}`);
    return data.data;
  },
  async setStatus(id, status) {
    const { data } = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return data.data;
  },
};
