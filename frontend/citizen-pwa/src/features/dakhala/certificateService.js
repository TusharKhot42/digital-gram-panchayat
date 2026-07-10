import { apiClient } from '@/services/api-client';

export const certificateService = {
  async apply({ certificateType, applicationData, documents }) {
    const form = new FormData();
    form.append('certificateType', certificateType);
    form.append('applicationData', JSON.stringify(applicationData));
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
