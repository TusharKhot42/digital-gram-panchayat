import axios from 'axios';

/** Bare HTTP client. Auth headers/401 interceptor land in M2 once AuthContext exists. */
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});
