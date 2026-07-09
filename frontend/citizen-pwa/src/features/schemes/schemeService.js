import { apiClient } from '@/services/api-client';

/** Public scheme reads (no token required; backend /schemes is public). */
export const schemeService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/schemes', { params });
    return data.data; // { data, total, page, limit }
  },
  async getOne(id) {
    const { data } = await apiClient.get(`/schemes/${id}`);
    return data.data;
  },
};
