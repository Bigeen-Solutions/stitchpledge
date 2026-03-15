import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../orders.api.ts';
import { keys } from '../../../query/keys.ts';

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: keys.orders.detail(id),
    queryFn: () => ordersApi.getOrderDetail(id),
    enabled: !!id,
  });
}

export function useMaterials(orderId: string) {
  // REDUNDANT: USE materials/hooks/useMaterialMutation instead
  return useQuery({
    queryKey: ['DEPRECATED_materials', orderId],
    queryFn: async () => [],
    enabled: false
  });
}

export function useMeasurements(orderId: string) {
  // REDUNDANT: USE measurement/hooks/useMeasurementMutation instead
  return useQuery({
    queryKey: ['DEPRECATED_measurements', orderId],
    queryFn: async () => [],
    enabled: false
  });
}
