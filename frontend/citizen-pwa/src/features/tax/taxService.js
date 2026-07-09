import { apiClient } from '@/services/api-client';

export const taxService = {
  async mine(params = {}) {
    const { data } = await apiClient.get('/tax/mine', { params });
    return data.data; // { data: TaxRecord[], totalDues }
  },
};
