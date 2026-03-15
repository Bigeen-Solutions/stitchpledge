import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../orders.api.ts';
import { keys } from '../../../query/keys.ts';

export function useOrders(page = 1, limit = 10) {
  return useQuery({
    queryKey: keys.orders.list(page, limit),
    queryFn: () => ordersApi.getOrders(page, limit),
    staleTime: 1000 * 30, // 30 seconds - deadline sensitive
    refetchOnWindowFocus: true,
  });
}

export function useCapacityWarning() {
  return useQuery({
    queryKey: ['orders', 'capacity-warning'],
    queryFn: ordersApi.getCapacityStatus,
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });
}
