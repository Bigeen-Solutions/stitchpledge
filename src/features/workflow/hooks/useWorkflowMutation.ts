import { useQuery, useMutation } from '@tanstack/react-query';
import { workflowApi } from '../workflow.api';
import { keys } from '../../../query/keys';
import { queryClient } from '../../../query/queryClient';
import { useToastStore } from '../../../components/feedback/Toast';

export function useWorkflow(orderId: string) {
  return useQuery({
    queryKey: keys.workflow.stages(orderId),
    queryFn: () => workflowApi.getWorkflow(orderId),
    enabled: !!orderId,
  });
}

export function useCompleteStage(orderId: string) {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (stageId: string) => workflowApi.completeStage(orderId, stageId),
    onSuccess: () => {
      // PURE REFRESH
      queryClient.invalidateQueries({ queryKey: keys.workflow.stages(orderId) });
      queryClient.invalidateQueries({ queryKey: keys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: keys.orders.all });
      
      showToast('Stage completion synchronized with backend.');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to sync stage completion.', 'error');
    }
  });
}
