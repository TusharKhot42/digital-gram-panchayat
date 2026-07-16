import { apiClient } from '@/services/api-client';

/**
 * Auth API calls for the citizen app. Each returns the unwrapped `data` payload
 * (the { success, data } envelope is peeled here so callers get user/token directly).
 */
export const authService = {
  async register(payload) {
    const { data } = await apiClient.post('/auth/register', payload);
    return data.data; // { user, token }
  },

  async login(payload) {
    const { data } = await apiClient.post('/auth/login', payload);
    return data.data; // { user, token }
  },

  /** Shared login: identifier is a mobile number or email, any role. */
  async loginSession(payload) {
    const { data } = await apiClient.post('/auth/session', payload);
    return data.data; // { user, token }
  },

  async getProfile() {
    const { data } = await apiClient.get('/auth/profile');
    return data.data.user;
  },

  async updateProfile(payload) {
    const { data } = await apiClient.put('/auth/profile', payload);
    return data.data.user;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Stateless token — a failed logout call still clears the client session.
    }
  },
};
