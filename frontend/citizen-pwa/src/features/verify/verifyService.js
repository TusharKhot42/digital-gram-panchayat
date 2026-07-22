import { apiClient } from '@/services/api-client';

// Public certificate verification — no auth (apiClient omits the Authorization header when
// there's no token, so this works for anyone, including signed-out visitors).
export const verifyService = {
  async byId(verificationId) {
    const { data } = await apiClient.get('/certificates/verify', { params: { verificationId } });
    return data.data;
  },
  async byNumber(certificateNumber) {
    const { data } = await apiClient.get('/certificates/verify', { params: { certificateNumber } });
    return data.data;
  },
};
