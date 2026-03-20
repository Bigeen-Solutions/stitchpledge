// src/features/auth/hooks/useAuth.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '../auth.api';
import { keys } from '../../../query/keys';
import { queryClient } from '../../../query/queryClient';

export function useMe() {
  return useQuery({
    queryKey: keys.auth.me,
    queryFn: async () => {
      try {
        const data = await authApi.getMe();
        console.log('✅ getMe success:', data);
        return data;
      } catch (err: any) {
        console.log('❌ getMe failed:', err.response?.status, err.response?.data);
        throw err;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // WIPE EVERYTHING
      localStorage.removeItem('access_token');
      queryClient.clear();
      window.location.href = '/login';
    },
  });
}
