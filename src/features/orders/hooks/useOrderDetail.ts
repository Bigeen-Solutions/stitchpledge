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
  return useQuery({
    queryKey: keys.materials.ledger(orderId),
    queryFn: async () => {
      const { data } = await (await import('../../../api/client.ts')).apiClient.get(`/orders/${orderId}/materials/ledger`);
      return data;
    },
    enabled: !!orderId,
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
