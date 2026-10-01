import { apiClient } from '@/services/api-client';

export const timetableService = {
  async get() {
    const { data } = await apiClient.get('/timetable');
    return data.data;
  },
};
