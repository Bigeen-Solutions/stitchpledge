import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

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

      // Catch domain-specific errors for UI alerts
      if (error.response?.data && (error.response.data as any).code === 'CAPACITY_EXCEEDED') {
        window.dispatchEvent(new CustomEvent('sf-capacity-exceeded'));
      }

      return Promise.reject(error);
    }
  );
};
