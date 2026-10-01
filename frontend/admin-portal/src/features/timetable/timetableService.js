import { apiClient } from '@/services/api-client';

export const timetableService = {
  async get() {
    const { data } = await apiClient.get('/admin/timetable');
    return data.data;
  },
  async update(payload) {
    const { data } = await apiClient.put('/admin/timetable', payload);
    return data.data;
  },
  async reset() {
    const { data } = await apiClient.post('/admin/timetable/reset');
    return data.data;
  },
};
