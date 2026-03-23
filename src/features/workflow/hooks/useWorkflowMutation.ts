import { useQuery, useMutation } from "@tanstack/react-query"
import { workflowApi } from "../workflow.api"
import { keys } from "../../../query/keys"
import { queryClient } from "../../../query/queryClient"
import { useToastStore } from "../../../components/feedback/Toast"
import { useDomainError } from "../../../lib/errors"

export function useGarmentWorkflow(garmentId: string) {
  return useQuery({
    queryKey: keys.workflow.garment(garmentId),
    queryFn: () => workflowApi.getGarmentWorkflow(garmentId),
    enabled: !!garmentId,
  })
}

export function useReportStageCompletion(garmentId: string, orderId?: string) {
  const showToast = useToastStore((state) => state.showToast)
  const { handleError } = useDomainError()

  return useMutation({
    mutationFn: (params: { stageId: string; evidencePhotoUrls?: string[] }) =>
      workflowApi.reportStageCompletion({ garmentId, ...params }),
    onSuccess: () => {
      // PURE REFRESH
      queryClient.invalidateQueries({
        queryKey: keys.workflow.garment(garmentId),
      })
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: keys.orders.detail(orderId) })
        queryClient.invalidateQueries({
          queryKey: keys.orders.garments(orderId),
        })
      }
      queryClient.invalidateQueries({ queryKey: keys.orders.all })
      queryClient.invalidateQueries({ queryKey: keys.analytics.overview })
      queryClient.invalidateQueries({ queryKey: keys.workflow.activeTasks })

      showToast("Action Successful", "Information updated.")
    },
    onError: (err: any) => {
      handleError(err)
    },
  })
}

export function useWorkflow(orderId: string) {
  return useGarmentWorkflow(orderId)
}

export function useCompleteStage(orderId: string) {
  const mutation = useReportStageCompletion(orderId)

  return {
    ...mutation,
    mutate: (stageId: string) => mutation.mutate({ stageId }),
    mutateAsync: (stageId: string) => mutation.mutateAsync({ stageId }),
  }
}
