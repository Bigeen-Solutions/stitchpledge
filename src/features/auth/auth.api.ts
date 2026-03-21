import { apiClient } from '../../infrastructure/http/axios.client';
import type { LoginDTO, AuthResponse } from './auth.types';

/**
 * Login with email and password.
 * Backend sets HttpOnly refresh cookie automatically.
 */
export async function loginApi(dto: LoginDTO): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', dto);
  return response.data;
}

/**
 * Call refresh endpoint to get new access token using HttpOnly cookie.
 * No request body needed.
 */
export async function refreshApi(): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/refresh');
  return response.data;
}

/**
 * Clear session on backend (HttpOnly cookie will be wiped).
 */
export async function logoutApi(): Promise<void> {
  await apiClient.post('/auth/logout');
}
