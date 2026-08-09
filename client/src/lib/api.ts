import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.access;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 & token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = useAuthStore.getState().tokens?.refresh;
      if (refresh) {
        try {
          const res = await axios.post('/api/auth/refresh/', { refresh });
          const newAccess = res.data.access;

          useAuthStore.getState().setTokens({
            access: newAccess,
            refresh: res.data.refresh || refresh,
          });

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch {
          // Keep session intact as guest
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
