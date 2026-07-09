import { apiClient } from '@/services/api-client';

export const taxService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/admin/tax', { params });
    return data.data;
  },
  async getOne(id) {
    const { data } = await apiClient.get(`/admin/tax/${id}`);
    return data.data;
  },
  async history(id) {
    const { data } = await apiClient.get(`/admin/tax/${id}/history`);
    return data.data;
  },
  async lookupCitizen(mobile) {
    const { data } = await apiClient.get('/admin/tax/lookup', { params: { mobile } });
    return data.data;
  },
  async create(payload) {
    const { data } = await apiClient.post('/admin/tax', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/admin/tax/${id}`, payload);
    return data.data;
  },
  async addPayment(id, payload) {
    const { data } = await apiClient.post(`/admin/tax/${id}/payment`, payload);
    return data.data;
  },
};
