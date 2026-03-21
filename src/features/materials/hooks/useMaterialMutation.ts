import { useQuery, useMutation } from '@tanstack/react-query';
import { materialsApi } from '../materials.api';
import { keys } from '../../../query/keys';
import { queryClient } from '../../../query/queryClient';
import { useToastStore } from '../../../components/feedback/Toast';
import { useDomainError } from '../../../lib/errors';

export function useMaterials(orderId: string) {
  return useQuery({
    queryKey: keys.materials.ledger(orderId),
    queryFn: () => materialsApi.getMaterialsLedger(orderId),
    enabled: !!orderId,
  });
}

export function useAdjustMaterial(orderId: string) {
  const showToast = useToastStore((state) => state.showToast);
  const { handleError } = useDomainError();

  return useMutation({
    mutationFn: (data: { delta: number, reason: string }) => materialsApi.adjustMaterial(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.materials.ledger(orderId) });
      showToast('Adjustment Synchronized', 'Material stock adjustment synchronized.');
    },
    onError: (err: any) => {
      handleError(err);
    }
  });
}
