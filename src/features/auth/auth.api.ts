import { apiClient } from "../../infrastructure/http/axios.client"
import type { LoginDTO, AuthResponse } from "./auth.types"

/**
 * Login with email and password.
 * Backend sets HttpOnly refresh cookie automatically.
 */
export async function loginApi(dto: LoginDTO): Promise<AuthResponse> {
  const response = await apiClient.post("/auth/login", dto)
  const raw = response.data

  return {
    accessToken: raw.accessToken,
    user: {
      id: raw.user.id ?? raw.user.userId,
      companyId: raw.user.companyId,
      email: raw.user.email,
      fullName: raw.user.fullName,
      role: raw.user.role,
      capabilities: raw.user.capabilities ?? raw.user.permissions ?? [],
      mustChangePassword: raw.user.mustChangePassword ?? false,
    },
  }
}

/**
 * Call refresh endpoint to get new access token using HttpOnly cookie.
 * No request body needed.
 */
export async function refreshApi(): Promise<AuthResponse> {
  const response = await apiClient.post("/auth/refresh")
  const raw = response.data

  return {
    accessToken: raw.accessToken,
    user: {
      id: raw.user.id ?? raw.user.userId,
      companyId: raw.user.companyId,
      email: raw.user.email,
      fullName: raw.user.fullName,
      role: raw.user.role,
      capabilities: raw.user.capabilities ?? raw.user.permissions ?? [],
    },
  }
}

/**
 * Clear session on backend (HttpOnly cookie will be wiped).
 */
export async function logoutApi(): Promise<void> {
  await apiClient.post("/auth/logout")
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email })
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/reset-password", { token, newPassword })
}

export async function changePasswordApi(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/change-password", { currentPassword, newPassword })
}

export interface TenantDTO {
  storeId: string;
  storeName: string;
  companyId: string;
  role: string;
}

/**
 * List all tenants (store contexts) the current user can access.
 */
export async function getTenantsApi(): Promise<TenantDTO[]> {
  const response = await apiClient.get("/auth/tenants")
  return response.data
}

/**
 * Switch the active store context. Returns a fresh token pair.
 */
export async function switchTenantApi(storeId: string): Promise<AuthResponse> {
  const response = await apiClient.post("/auth/switch-tenant", { storeId })
  const raw = response.data
  return {
    accessToken: raw.accessToken,
    user: {
      id: raw.user.id ?? raw.user.userId,
      companyId: raw.user.companyId,
      email: raw.user.email,
      fullName: raw.user.fullName,
      role: raw.user.role,
      capabilities: raw.user.capabilities ?? raw.user.permissions ?? [],
    },
  }
}
