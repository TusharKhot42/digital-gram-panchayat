import { apiClient } from '@/services/api-client';

/** Officer auth API calls (admin portal). Peels the { success, data } envelope. */
export const authService = {
  async login(payload) {
    const { data } = await apiClient.post('/admin/login', payload);
    return data.data; // { user, token }
  },

  async getProfile() {
    const { data } = await apiClient.get('/admin/profile');
    return data.data.user;
  },

  async logout() {
    try {
      await apiClient.post('/admin/logout');
    } catch {
      // Stateless token — clearing the client session is enough.
    }
  },
};
