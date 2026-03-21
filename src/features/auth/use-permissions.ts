import { useAuthStore } from './auth.store';
import type { Permission, StitchFlowRole } from './auth.types';

/**
 * Hook for component-level RBAC gating.
 * Purely driven by the permissions array returned by the backend.
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  /**
   * Checks if the user has a specific permission.
   * NEVER derive permissions from roles here — the API is the source of truth.
   */
  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const role: StitchFlowRole | null = user?.role || null;

  return {
    can,
    role,
    isCustomer: role === 'CUSTOMER',
    isOwnerOrManager: role === 'OWNER' || role === 'MANAGER',
  };
}
