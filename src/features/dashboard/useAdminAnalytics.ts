import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from './analytics.api';
import { keys } from '../../query/keys';

/**
 * Hook to fetch the flattened Admin Analytics scalars.
 * Implements defensive caching as per Phase Alpha Synchrony requirements.
 */
export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: keys.analytics.admin,
    queryFn: analyticsApi.getAdminAnalytics,
    staleTime: 60000,   // 1 minute defensive caching
    refetchInterval: 300000, // 5 minute background refresh
  });
};
