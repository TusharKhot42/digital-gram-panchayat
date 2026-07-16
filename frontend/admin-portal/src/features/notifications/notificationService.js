import { apiClient } from '@/services/api-client';

export const notificationService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/admin/notifications', { params });
    return data.data;
  },
  async getOne(id) {
    const { data } = await apiClient.get(`/admin/notifications/${id}`);
    return data.data;
  },
  async stats() {
    const { data } = await apiClient.get('/admin/notifications/stats');
    return data.data;
  },
  async listBroadcasts(params = {}) {
    const { data } = await apiClient.get('/admin/notifications/broadcasts', { params });
    return data.data;
  },
  async broadcastRecipients(broadcastId, params = {}) {
    const { data } = await apiClient.get(`/admin/notifications/broadcasts/${broadcastId}`, {
      params,
    });
    return data.data;
  },
  async broadcast(payload) {
    const { data } = await apiClient.post('/admin/notifications/broadcast', payload);
    return data.data;
  },
  async retry(id) {
    const { data } = await apiClient.post(`/admin/notifications/${id}/retry`);
    return data.data;
  },
};
