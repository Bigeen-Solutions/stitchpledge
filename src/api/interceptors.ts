import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { parseApiError } from '../lib/errors';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const setupInterceptors = (apiClient: AxiosInstance) => {
  // Request Interceptor: Attach access token
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    console.log('🔑 Request to:', config.url)
    console.log('🔑 Token in localStorage:', token ? token.substring(0, 20) + '...' : 'NULL')
    console.log('🔑 Auth header being set:', !!token)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

  // Response Interceptor: Handle Silence Refresh
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Never attempt to refresh if the 401 came from the login or refresh endpoints themselves!
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      // If error is 401 and not already retrying
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Add to queue if refreshing is already in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt silent refresh via backend HttpOnly cookie
          const { data } = await apiClient.post('/auth/refresh');
          const { accessToken } = data;

          localStorage.setItem('access_token', accessToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          processQueue(null, accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          // If refresh fails, clear state and redirect
          localStorage.removeItem('access_token');
          window.location.href = '/login';

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Attach pre-parsed domain error for easier UI consumption
      (error as any).parsedError = parseApiError(error);

      return Promise.reject(error);
    }
  );
};
