import { useQuery, useMutation } from '@tanstack/react-query';
import { workflowApi } from '../workflow.api';
import { keys } from '../../../query/keys';
import { queryClient } from '../../../query/queryClient';
import { useToastStore } from '../../../components/feedback/Toast';
import { mapErrorCode } from '../../../utils/errorMapper';

export function useGarmentWorkflow(garmentId: string) {
  return useQuery({
    queryKey: keys.workflow.garment(garmentId),
    queryFn: () => workflowApi.getGarmentWorkflow(garmentId),
    enabled: !!garmentId,
  });
}

export function useReportStageCompletion(garmentId: string, orderId?: string) {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (params: { stageId: string; evidencePhotoUrls?: string[] }) => 
      workflowApi.reportStageCompletion({ garmentId, ...params }),
    onSuccess: () => {
      // PURE REFRESH
      queryClient.invalidateQueries({ queryKey: keys.workflow.garment(garmentId) });
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: keys.orders.detail(orderId) });
        queryClient.invalidateQueries({ queryKey: keys.orders.garments(orderId) });
      }
      queryClient.invalidateQueries({ queryKey: keys.orders.all });
      
      showToast('Stage completion synchronized.');
    },
    onError: (err: any) => {
      showToast(mapErrorCode(err.response?.data?.code), 'error');
    }
  });
}
