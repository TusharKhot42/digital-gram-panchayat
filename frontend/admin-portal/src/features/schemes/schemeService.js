import { apiClient } from '@/services/api-client';

/**
 * Multipart body builder. Empty strings ARE sent — that's how an edit clears a field
 * (the backend maps '' to unset); dropping them would silently keep the old value.
 * `files` = { image?, attachments?: File[], removeAttachments?: string[], removeImage?: bool }.
 */
function toFormData(values, files = {}) {
  const form = new FormData();
  Object.entries(values).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (k === 'requiredDocuments' && Array.isArray(v)) {
      form.append(k, v.join('\n'));
    } else {
      form.append(k, v);
    }
  });
  if (files.image) form.append('image', files.image);
  (files.attachments || []).forEach((f) => form.append('attachments', f));
  if (files.removeAttachments?.length) {
    form.append('removeAttachments', files.removeAttachments.join('\n'));
  }
  if (files.removeImage) form.append('removeImage', 'true');
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
  async create(values, files) {
    const { data } = await apiClient.post('/admin/schemes', toFormData(values, files));
    return data.data;
  },
  async update(id, values, files) {
    const { data } = await apiClient.put(`/admin/schemes/${id}`, toFormData(values, files));
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
