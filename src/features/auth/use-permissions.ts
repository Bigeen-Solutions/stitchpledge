import { useAuthStore } from './auth.store';

/**
 * Capability Definitions
 * These must match the backend auth.types.ts exactly.
 */
export const Capability = {
  MANAGE_ORDERS: 'MANAGE_ORDERS',
  BYPASS_CAPACITY: 'BYPASS_CAPACITY',
  TRANSITION_STAGE: 'TRANSITION_STAGE',
  OVERRIDE_TRUST: 'OVERRIDE_TRUST',
  RAISE_DISPUTE: 'RAISE_DISPUTE',
  RESOLVE_DISPUTE: 'RESOLVE_DISPUTE',
  THAW_DISPUTE: 'THAW_DISPUTE',
  MANAGE_STAFF: 'MANAGE_STAFF',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  SUSPEND_ACCOUNT: 'SUSPEND_ACCOUNT',
} as const;

export type CapabilityType = (typeof Capability)[keyof typeof Capability];

/**
 * Hook for component-level capability gating.
 * Adheres to the "Pure Projection" doctrine.
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  /**
   * Checks if the user has a specific atomic capability.
   * NEVER check role names in the UI.
   */
  const hasCapability = (cap: CapabilityType): boolean => {
    if (!user || !user.capabilities) return false;
    return user.capabilities.includes(cap);
  };

  return {
    hasCapability,
    isAuthenticated: !!user,
    userId: user?.id,
    companyId: user?.companyId,
  };
}
