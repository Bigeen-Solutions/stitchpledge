export type Permission =
  | 'orders:read'
  | 'orders:write'
  | 'workflow:read'
  | 'workflow:write'
  | 'materials:read'
  | 'materials:write'
  | 'measurements:read'
  | 'measurements:write'
  | 'staff:read'
  | 'staff:write'
  | 'capacity:read'
  | 'reports:read'
  | 'customer:portal'; // read-only customer role

export type StitchFlowRole = 'OWNER' | 'MANAGER' | 'TAILOR' | 'CUSTOMER';

export interface AuthUser {
  userId: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: StitchFlowRole;
  permissions: Permission[]; // Explicit list from backend — never derived locally
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null; // In-memory only. NEVER localStorage.
  isAuthenticated: boolean;
  isLoading: boolean; // True during silent refresh attempt on app boot
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
  // Refresh token is HttpOnly cookie — never in this response body
}
