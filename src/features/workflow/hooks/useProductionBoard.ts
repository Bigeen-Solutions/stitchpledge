import { useQuery, useMutation } from '@tanstack/react-query';
import { workflowApi } from '../workflow.api';
import { keys } from '../../../query/keys';
import { queryClient } from '../../../query/queryClient';
import { useToastStore } from '../../../components/feedback/Toast';
import { useDomainError } from '../../../lib/errors';

/**
 * Fetches all ACTIVE stage instances across the floor.
 * The backend applies store-boundary isolation based on the user's injectScope.
 */
export function useActiveTasks() {
  return useQuery({
    queryKey: keys.workflow.activeTasks,
    queryFn: () => workflowApi.getActiveTasks(),
    refetchInterval: 30_000, // Refresh every 30s for near-real-time feel
  });
}

/**
 * Marks a stage complete and invalidates the Kanban board so the card disappears.
 * Follows the Pure Refresh sequence: command → toast → invalidate → refetch.
 */
export function useMarkStageComplete() {
  const showToast = useToastStore((state) => state.showToast);
  const { handleError } = useDomainError();

  return useMutation({
    mutationFn: (params: { garmentId: string; stageId: string }) =>
      workflowApi.reportStageCompletion(params),
    onSuccess: (_data, variables) => {
      // 1. Invalidate the production board so the completed card disappears
      queryClient.invalidateQueries({ queryKey: keys.workflow.activeTasks });
      // 2. Also invalidate the per-garment workflow view used inside the modal
      queryClient.invalidateQueries({
        queryKey: keys.workflow.garment(variables.garmentId),
      });
      // 3. Invalidate orders to reflect updated progress
      queryClient.invalidateQueries({ queryKey: keys.orders.all });

      showToast('Stage Complete', 'Task marked as done. Moving to next station.');
    },
    onError: (err: unknown) => {
      handleError(err);
    },
  });
}
