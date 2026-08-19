import { useQuery } from '@tanstack/react-query';
import { stitchScoreApi } from './stitchScore.api';
import { useAuthStore } from '../auth/auth.store';
export const useStitchScore = () => {
  const user = useAuthStore((state: any) => state.user);
  const companyId = user?.companyId;

  return useQuery({
    // We append the companyId to the base key (assuming keys.analytics.stitchScore exists or similar)
    // Let's use a hardcoded key if it doesn't exist, to avoid breaking if keys.ts isn't updated
    queryKey: ['stitchScore', companyId],
    queryFn: () => stitchScoreApi.getScore(companyId!),
    enabled: !!companyId,
    staleTime: 60000,   // 1 minute defensive caching
    refetchInterval: 300000, // 5 minute background refresh
  });
};
