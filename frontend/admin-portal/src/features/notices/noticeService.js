import { apiClient } from '@/services/api-client';

function toFormData(values, file) {
  const form = new FormData();
  Object.entries(values).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') form.append(k, v);
  });
  if (file) form.append('attachment', file);
  return form;
}

export const noticeService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/admin/notices', { params });
    return data.data;
  },
  async getOne(id) {
    const { data } = await apiClient.get(`/admin/notices/${id}`);
    return data.data;
  },
  async create(values, file) {
    const { data } = await apiClient.post('/admin/notices', toFormData(values, file));
    return data.data;
  },
  async update(id, values, file) {
    const { data } = await apiClient.put(`/admin/notices/${id}`, toFormData(values, file));
    return data.data;
  },
  async publish(id) {
    const { data } = await apiClient.patch(`/admin/notices/${id}/publish`);
    return data.data;
  },
  async archive(id) {
    const { data } = await apiClient.patch(`/admin/notices/${id}/archive`);
    return data.data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`/admin/notices/${id}`);
    return data.data;
  },
  async broadcast(id, payload) {
    const { data } = await apiClient.post(`/admin/notices/${id}/broadcast`, payload);
    return data.data;
  },
};
