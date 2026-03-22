import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from './use-permissions';
import { useAuthStore } from './auth.store';
import type { AuthUser } from './auth.types';

const mockUser: AuthUser = {
  userId: 'u1',
  tenantId: 't1',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'STORE_MANAGER',
  permissions: ['orders:read', 'staff:read'],
};

const mockCustomer: AuthUser = {
  userId: 'u2',
  tenantId: 't1',
  email: 'customer@example.com',
  fullName: 'Customer User',
  role: 'CUSTOMER',
  permissions: ['customer:portal'],
};

describe('usePermissions', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it('should return false for all permissions when no user is logged in', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.can('orders:read')).toBe(false);
    expect(result.current.can('staff:read')).toBe(false);
  });

  it('should return true when user has the specific permission', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    const { result } = renderHook(() => usePermissions());
    expect(result.current.can('orders:read')).toBe(true);
    expect(result.current.can('staff:read')).toBe(true);
  });

  it('should return false when user lack the specific permission', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    const { result } = renderHook(() => usePermissions());
    expect(result.current.can('orders:write')).toBe(false);
  });

  it('should correctly identify customer role', () => {
    useAuthStore.setState({ user: mockCustomer, isAuthenticated: true });
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isCustomer).toBe(true);
    expect(result.current.isCompanyAdminOrManager).toBe(false);
  });

  it('should correctly identify manager role', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isCustomer).toBe(false);
    expect(result.current.isCompanyAdminOrManager).toBe(true);
  });
});
