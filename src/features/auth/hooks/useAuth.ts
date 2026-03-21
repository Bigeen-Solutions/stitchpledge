// src/features/auth/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { logoutApi } from '../auth.api';
import { useAuthStore } from '../auth.store';
import { queryClient } from '../../../query/queryClient';
import { useDomainError } from '../../../lib/errors';

/**
 * FE-4/FE-5 FIX:
 * useMe() was a redundant TanStack Query that duplicated user identity
 * already held in Zustand auth store. Removed in favour of useAuthStore().
 *
 * If you need the user object in a component, use:
 *   const user = useAuthStore(state => state.user)
 */

export function useLogout() {
  const { handleError } = useDomainError();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      // FE-5 FIX: clear Zustand store — NOT localStorage
      clearAuth();
      queryClient.clear();
      window.location.href = '/login';
    },
    onError: (err: any) => handleError(err),
  });
}
