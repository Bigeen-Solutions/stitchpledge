import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productionApi } from '../production.api';
import { v4 as uuidv4 } from 'uuid';

export function useAvailableTransitions(garmentId: string) {
  return useQuery({
    queryKey: ['production', 'transitions', garmentId],
    queryFn: () => productionApi.getAvailableTransitions(garmentId),
    enabled: !!garmentId
  });
}

export function useAttemptTransition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ garmentId, targetStatus }: { garmentId: string, targetStatus: string }) => {
      const idempotencyKey = uuidv4();
      return productionApi.attemptTransition(garmentId, targetStatus, idempotencyKey);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'active-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['production', 'transitions', variables.garmentId] });
    }
  });
}
