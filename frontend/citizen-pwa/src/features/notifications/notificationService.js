import { apiClient } from '@/services/api-client';

export const notificationService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/notifications', { params });
    return data.data; // { data, total, page, limit, unread }
  },
  async unreadCount() {
    const { data } = await apiClient.get('/notifications/unread-count');
    return data.data.unread;
  },
  async getOne(id) {
    const { data } = await apiClient.get(`/notifications/${id}`);
    return data.data;
  },
  async markRead(id) {
    const { data } = await apiClient.patch(`/notifications/${id}/read`);
    return data.data;
  },
  async markAllRead() {
    const { data } = await apiClient.patch('/notifications/read-all');
    return data.data;
  },
};
