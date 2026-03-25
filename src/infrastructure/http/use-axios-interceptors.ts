import { useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiClient } from './axios.client';
import { useAuthStore } from '../../features/auth/auth.store';
import { useToastStore } from '../../components/feedback/Toast';
import { parseApiError } from '../../lib/errors/parse-api-error';

// Mutex state (module scope)
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

export function useAxiosInterceptors() {
  const navigate = useNavigate();
  const interceptorId = useRef<number | null>(null);

  useLayoutEffect(() => {
    // Eject existing interceptor if any
    if (interceptorId.current !== null) {
      apiClient.interceptors.response.eject(interceptorId.current);
    }

    // Register 401 Mutex + Navigation Interceptor
    interceptorId.current = apiClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // 1. Handle 401 Unauthorized (Session Expired or Missing)
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const response = await axios.post(
              `${apiClient.defaults.baseURL}/auth/refresh`,
              {},
              { withCredentials: true }
            );

            const { accessToken, user } = response.data;
            useAuthStore.getState().setAuth(accessToken, user);

            processQueue(null, accessToken);
            isRefreshing = false;

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;
            useAuthStore.getState().clearAuth();

            // Use useNavigate hook!
            if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
               navigate('/login');
            }

            return Promise.reject(refreshError);
          }
        }

        // 2. Handle 403 Forbidden
        if (error.response?.status === 403) {
          useToastStore.getState().showToast("Access Denied: You do not have permission for this area", "error");
          
          if (window.location.pathname !== "/dashboard" && window.location.pathname !== "/login") {
            navigate('/dashboard');
          }
          return Promise.reject(error);
        }

        // 3. Attach parsed error
        const parsedError = parseApiError(error);
        (error as any).parsedError = parsedError;

        return Promise.reject(error);
      }
    );

    return () => {
      if (interceptorId.current !== null) {
        apiClient.interceptors.response.eject(interceptorId.current);
      }
    };
  }, [navigate]);
}
