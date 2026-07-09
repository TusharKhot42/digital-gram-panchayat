import { apiClient } from '@/services/api-client';

export const complaintService = {
  /**
   * @param {{ category, title, description, latitude?, longitude?, accuracy?, address?, images?: File[] }} input
   */
  async create(input) {
    const form = new FormData();
    form.append('category', input.category);
    form.append('title', input.title);
    form.append('description', input.description);
    if (input.address) form.append('address', input.address);
    if (input.latitude != null && input.longitude != null) {
      form.append('latitude', String(input.latitude));
      form.append('longitude', String(input.longitude));
      if (input.accuracy != null) form.append('accuracy', String(input.accuracy));
    }
    (input.images || []).forEach((file) => form.append('images', file));

    const { data } = await apiClient.post('/complaints', form);
    return data.data;
  },

  async listMine(params = {}) {
    const { data } = await apiClient.get('/complaints/mine', { params });
    return data.data; // { data, total, page, limit }
  },

  async getOne(id) {
    const { data } = await apiClient.get(`/complaints/${id}`);
    return data.data;
  },
};
