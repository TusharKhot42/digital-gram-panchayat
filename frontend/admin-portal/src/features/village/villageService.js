import { apiClient } from '@/services/api-client';

/**
 * Village Profile is edited as JSON sections plus optional logo/banner files. Object/array
 * sections are JSON-stringified into a multipart body so images ride along in one request;
 * the backend parses the strings and shallow-merges object sections.
 */
function toFormData(sections, files = {}) {
  const form = new FormData();
  Object.entries(sections).forEach(([k, v]) => {
    if (v === undefined) return;
    form.append(k, typeof v === 'string' ? v : JSON.stringify(v));
  });
  if (files.logo) form.append('logo', files.logo);
  if (files.banner) form.append('banner', files.banner);
  return form;
}

export const villageService = {
  async get() {
    const { data } = await apiClient.get('/village');
    return data.data;
  },
  async update(sections, files) {
    const { data } = await apiClient.put('/admin/village', toFormData(sections, files));
    return data.data;
  },
};

export const eventService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/admin/events', { params });
    return data.data;
  },
  async create(values, file) {
    const form = new FormData();
    Object.entries(values).forEach(([k, v]) => v != null && v !== '' && form.append(k, v));
    if (file) form.append('image', file);
    const { data } = await apiClient.post('/admin/events', form);
    return data.data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`/admin/events/${id}`);
    return data.data;
  },
};
