import { apiClient } from '@/services/api-client';

export const dashboardService = {
  async metrics() {
    const { data } = await apiClient.get('/admin/dashboard/metrics');
    return data.data;
  },
  async charts() {
    const { data } = await apiClient.get('/admin/dashboard/charts');
    return data.data;
  },
  async activity() {
    const { data } = await apiClient.get('/admin/dashboard/activity');
    return data.data;
  },
};
