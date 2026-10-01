import { apiClient } from '@/services/api-client';

export const certificateService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/admin/dakhala', { params });
    return data.data;
  },
  async getOne(id) {
    const { data } = await apiClient.get(`/admin/dakhala/${id}`);
    return data.data;
  },
  async review(id) {
    const { data } = await apiClient.patch(`/admin/dakhala/${id}/review`);
    return data.data;
  },
  async approve(id, payload = {}) {
    if (payload instanceof FormData) {
      const { data } = await apiClient.patch(`/admin/dakhala/${id}/approve`, payload);
      return data.data;
    }
    if (payload.file) {
      const fd = new FormData();
      fd.append('certificate', payload.file);
      if (payload.applicationData) {
        fd.append('applicationData', JSON.stringify(payload.applicationData));
      }
      if (payload.officerRemarks) {
        fd.append('officerRemarks', payload.officerRemarks);
      }
      const { data } = await apiClient.patch(`/admin/dakhala/${id}/approve`, fd);
      return data.data;
    }
    const { data } = await apiClient.patch(`/admin/dakhala/${id}/approve`, payload);
    return data.data;
  },
  async uploadCertificate(id, { file, officerRemarks, certificateNumber } = {}) {
    const fd = new FormData();
    if (file) fd.append('certificate', file);
    if (officerRemarks) fd.append('officerRemarks', officerRemarks);
    if (certificateNumber) fd.append('certificateNumber', certificateNumber);
    const { data } = await apiClient.post(`/admin/dakhala/${id}/certificate`, fd);
    return data.data;
  },
  async reject(id, reason) {
    const { data } = await apiClient.patch(`/admin/dakhala/${id}/reject`, { reason });
    return data.data;
  },
};
