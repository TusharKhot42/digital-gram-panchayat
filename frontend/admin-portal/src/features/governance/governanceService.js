import { apiClient } from '@/services/api-client';

/** Multipart when there are files, JSON otherwise — the API accepts both. */
function toFormData(values, files = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;
    form.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
  }
  for (const [field, list] of Object.entries(files)) {
    for (const file of [].concat(list ?? [])) {
      if (file) form.append(field, file);
    }
  }
  return form;
}

export const meetingService = {
  async list(params) {
    const { data } = await apiClient.get('/admin/meetings', { params });
    return data.data;
  },
  async create(values, files) {
    const { data } = await apiClient.post('/admin/meetings', toFormData(values, files));
    return data.data;
  },
  async update(id, values, files) {
    const { data } = await apiClient.put(`/admin/meetings/${id}`, toFormData(values, files));
    return data.data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`/admin/meetings/${id}`);
    return data.data;
  },
};

export const projectService = {
  async list(params) {
    const { data } = await apiClient.get('/admin/projects', { params });
    return data.data;
  },
  async create(values, photos) {
    const { data } = await apiClient.post('/admin/projects', toFormData(values, { photos }));
    return data.data;
  },
  async update(id, values, photos) {
    const { data } = await apiClient.put(`/admin/projects/${id}`, toFormData(values, { photos }));
    return data.data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`/admin/projects/${id}`);
    return data.data;
  },
};

export const pollService = {
  async list(params) {
    const { data } = await apiClient.get('/admin/polls', { params });
    return data.data;
  },
  async create(values) {
    const { data } = await apiClient.post('/admin/polls', values);
    return data.data;
  },
  async update(id, values) {
    const { data } = await apiClient.put(`/admin/polls/${id}`, values);
    return data.data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`/admin/polls/${id}`);
    return data.data;
  },
};

export const documentService = {
  async list(params) {
    const { data } = await apiClient.get('/admin/downloads', { params });
    return data.data;
  },
  async create(values, file) {
    const { data } = await apiClient.post('/admin/downloads', toFormData(values, { file }));
    return data.data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`/admin/downloads/${id}`);
    return data.data;
  },
};

export const feedbackService = {
  async analytics(months = 6) {
    const { data } = await apiClient.get('/admin/feedback/analytics', { params: { months } });
    return data.data;
  },
  async list(params) {
    const { data } = await apiClient.get('/admin/feedback', { params });
    return data.data;
  },
};
