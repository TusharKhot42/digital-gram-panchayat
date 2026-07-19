import axios from 'axios';
import { TOKEN_STORAGE_KEY, REQUEST_ID_HEADER } from '@dgp/shared';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});

// Attach the persisted JWT + a fresh correlation id to every request. The server echoes
// the id back and threads it through its logs, so a user-reported failure can be traced.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (globalThis.crypto?.randomUUID) {
    config.headers[REQUEST_ID_HEADER] = globalThis.crypto.randomUUID();
  }
  return config;
});

// On an expired/invalid session, clear the token and notify the app to redirect to login.
// AuthProvider listens for 'auth:unauthorized'.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);
