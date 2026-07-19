import { apiClient } from '@/services/api-client';

export const auditService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/admin/audit', { params });
    return data.data;
  },
};
