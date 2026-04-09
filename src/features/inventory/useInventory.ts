import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from './inventory.api';
import { keys } from '../../query/keys';

/**
 * Hook to fetch the Material Stock positions.
 * Implements 30s staleTime for snappy but accurate dashboard telemetry.
 */
export const useInventory = () => {
  return useQuery({
    queryKey: keys.inventory.overview,
    queryFn: inventoryApi.getInventoryOverview,
    staleTime: 30000, // 30 seconds
  });
};
