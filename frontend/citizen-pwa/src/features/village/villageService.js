import { apiClient } from '@/services/api-client';

// Public endpoints — no auth. apiClient simply omits the Authorization header when there's
// no token, so these work for a signed-out visitor on the landing page.
export const villageService = {
  async profile() {
    const { data } = await apiClient.get('/village');
    return data.data;
  },
  async events() {
    const { data } = await apiClient.get('/events');
    return data.data;
  },
};
