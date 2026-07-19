import axios from 'axios';
import { ADMIN_TOKEN_STORAGE_KEY, REQUEST_ID_HEADER } from '@dgp/shared';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});

// Attach the persisted JWT + a fresh correlation id (echoed back and logged server-side).
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (globalThis.crypto?.randomUUID) {
    config.headers[REQUEST_ID_HEADER] = globalThis.crypto.randomUUID();
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);
