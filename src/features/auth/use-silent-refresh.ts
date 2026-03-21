import { useEffect } from 'react';
import { useAuthStore } from './auth.store';
import { refreshApi } from './auth.api';

/**
 * Hook to be called ONCE in App.tsx root.
 * Handles the silent refresh lifecycle on application boot.
 */
export function useSilentRefresh() {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function attemptRefresh() {
      setLoading(true);
      try {
        const { accessToken, user } = await refreshApi();
        if (isMounted) {
          setAuth(accessToken, user);
        }
      } catch (error) {
        // Silent failure — user stays logged out
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    attemptRefresh();

    return () => {
      isMounted = false;
    };
  }, [setAuth, clearAuth, setLoading]);
}
