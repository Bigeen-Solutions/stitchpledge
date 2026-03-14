import { apiClient } from '../../api/client';

export interface Stage {
  id: string;
  name: string;
  status: string;
  isWarning: boolean;
  isComplete: boolean;
  isActive: boolean;
}

export interface WorkflowProjection {
  stages: Stage[];
  activeStageIndex: number;
  isWarning: boolean;
}

export const workflowApi = {
  getWorkflow: async (orderId: string) => {
    const { data } = await apiClient.get<WorkflowProjection>(`/orders/${orderId}/workflow`);
    return data;
  },
  
  completeStage: async (orderId: string, stageId: string) => {
    await apiClient.post(`/orders/${orderId}/workflow/stages/${stageId}/complete`);
  }
};
