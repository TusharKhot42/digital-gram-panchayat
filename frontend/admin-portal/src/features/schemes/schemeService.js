import { apiClient } from '@/services/api-client';

function toFormData(values, file) {
  const form = new FormData();
  Object.entries(values).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (k === 'requiredDocuments' && Array.isArray(v)) {
      form.append(k, v.join('\n'));
    } else {
      form.append(k, v);
    }
  });
  if (file) form.append('image', file);
  return form;
}

export const schemeService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/admin/schemes', { params });
    return data.data;
  },
  async getOne(id) {
    const { data } = await apiClient.get(`/admin/schemes/${id}`);
    return data.data;
  },
  async create(values, file) {
    const { data } = await apiClient.post('/admin/schemes', toFormData(values, file));
    return data.data;
  },
  async update(id, values, file) {
    const { data } = await apiClient.put(`/admin/schemes/${id}`, toFormData(values, file));
    return data.data;
  },
  async publish(id) {
    const { data } = await apiClient.patch(`/admin/schemes/${id}/publish`);
    return data.data;
  },
  async unpublish(id) {
    const { data } = await apiClient.patch(`/admin/schemes/${id}/unpublish`);
    return data.data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`/admin/schemes/${id}`);
    return data.data;
  },
};
