import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../orders.api.ts';
import { keys } from '../../../query/keys.ts';
import { useToastStore } from '../../../components/feedback/Toast.tsx';

export function useUpdateOrder(id: string) {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (data: { eventDate?: string, lockedMeasurementVersionId?: string }) => 
      ordersApi.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.orders.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      queryClient.invalidateQueries({ queryKey: keys.analytics.admin });
      showToast("Order updated successfully", "success");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || "Failed to update order", "error");
    }
  });
}
