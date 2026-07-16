import { apiClient } from '@/services/api-client';

export const reportService = {
  async get() {
    const { data } = await apiClient.get('/admin/dashboard/report');
    return data.data;
  },
};
