import { useQuery } from "@tanstack/react-query";
import { workflowApi } from "../workflow.api";
import { keys } from "../../../query/keys";

export function useWorkflowTemplates() {
  return useQuery({
    queryKey: keys.workflow.templates,
    queryFn: () => workflowApi.getTemplates(),
    staleTime: 1000 * 60 * 60, // 1 hour (templates don't change often)
  });
}
