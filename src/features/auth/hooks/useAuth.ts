import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '../auth.api';
import { keys } from '../../../query/keys';
import { queryClient } from '../../../query/queryClient';

export function useMe() {
  return useQuery({
    queryKey: keys.auth.me,
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
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
