import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workflowApi } from "../workflow.api";
import { keys } from "../../../query/keys";
import { useToastStore } from "../../../components/feedback/Toast";

export function useWorkflowTemplates() {
  return useQuery({
    queryKey: keys.workflow.templates,
    queryFn: () => workflowApi.getTemplates(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTemplateStages(templateId: string | undefined) {
  return useQuery({
    queryKey: ['workflow', 'template-stages', templateId],
    queryFn: () => workflowApi.getTemplateStages(templateId!),
    enabled: !!templateId,
  });
}

export function useAddTemplateStage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ templateId, name, duration }: { templateId: string; name: string; duration: number }) =>
      workflowApi.addTemplateStage(templateId, name, duration),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'template-stages', variables.templateId] });
      showToast('Stage Added', 'Workflow blueprint has been updated.', 'success');
    },
    onError: (error: any) => {
      showToast('Error', error.message || 'Failed to add stage', 'error');
    }
  });
}
