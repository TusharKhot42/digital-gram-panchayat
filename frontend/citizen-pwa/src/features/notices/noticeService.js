import { apiClient } from '@/services/api-client';

/** Public notice reads. No token required (backend /notices is public), but the shared
 *  client harmlessly attaches one if the citizen is logged in. */
export const noticeService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/notices', { params });
    return data.data; // { data, total, page, limit }
  },

  async getOne(id) {
    const { data } = await apiClient.get(`/notices/${id}`);
    return data.data;
  },
};
