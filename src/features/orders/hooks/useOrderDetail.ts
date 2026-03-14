import { useQuery, useMutation } from '@tanstack/react-query';
import { ordersApi } from '../orders.api.ts';
import type { Order } from '../orders.api.ts';
import { keys } from '../../../query/keys.ts';
import { queryClient } from '../../../query/queryClient.ts';

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: keys.orders.detail(id),
    queryFn: () => ordersApi.getOrderDetail(id),
    enabled: !!id,
  });
}

export function useCompleteStage(orderId: string) {
  return useMutation({
    mutationFn: (stageId: string) => ordersApi.completeStage(orderId, stageId),
    onSuccess: () => {
      // PURE REFRESH: Invalidate and refetch everything related to this order
      queryClient.invalidateQueries({ queryKey: keys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: keys.workflow.stages(orderId) });
      queryClient.invalidateQueries({ queryKey: keys.orders.all });
    },
  });
}

export function useWorkflow(orderId: string) {
  return useQuery({
    queryKey: keys.workflow.stages(orderId),
    queryFn: async () => {
      const { data } = await (await import('../../../api/client.ts')).apiClient.get(`/orders/${orderId}/workflow/stages`);
      return data;
    },
    enabled: !!orderId,
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
  return useQuery({
    queryKey: keys.measurements.list(orderId),
    queryFn: async () => {
      const { data } = await (await import('../../../api/client.ts')).apiClient.get(`/orders/${orderId}/measurements`);
      return data;
    },
    enabled: !!orderId,
  });
}
