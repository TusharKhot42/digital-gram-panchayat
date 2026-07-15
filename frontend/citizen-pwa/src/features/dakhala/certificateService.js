import { apiClient } from '@/services/api-client';

export const certificateService = {
  async apply({ certificateType, applicationData, documents, documentMeta }) {
    const form = new FormData();
    form.append('certificateType', certificateType);
    form.append('applicationData', JSON.stringify(applicationData));
    // Positionally aligned with `documents` — tells the server what each file is.
    if (documentMeta) form.append('documentMeta', JSON.stringify(documentMeta));
    (documents || []).forEach((file) => form.append('documents', file));
    const { data } = await apiClient.post('/dakhala', form);
    return data.data;
  },
  async listMine(params = {}) {
    const { data } = await apiClient.get('/dakhala/mine', { params });
    return data.data;
  },
  async getOne(id) {
    const { data } = await apiClient.get(`/dakhala/${id}`);
    return data.data;
  },
  async getCertificate(id) {
    const { data } = await apiClient.get(`/dakhala/${id}/certificate`);
    return data.data; // { applicationId, pdfUrl }
  },
};
