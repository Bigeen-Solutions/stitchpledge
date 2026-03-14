import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../orders.api.ts';
import { keys } from '../../../query/keys.ts';

export function useOrders() {
  return useQuery({
    queryKey: keys.orders.all,
    queryFn: ordersApi.getOrders,
  });
}

export function useCapacityWarning() {
  return useQuery({
    queryKey: ['orders', 'capacity-warning'],
    queryFn: ordersApi.getCapacityStatus,
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });
}
