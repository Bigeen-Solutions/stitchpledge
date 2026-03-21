import { apiClient } from '../../api/client';

export interface StageInstance {
  id: string;
  workflowInstanceId: string;
  stageId: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'BLOCKED';
  completedBy: string | null;
  completedAt: string | null;
  evidencePhotoUrls: string[] | null;
}

export interface WorkflowInstance {
  id: string;
  garmentId: string;
  templateVersionId: string;
}

export interface GarmentWorkflowResponse {
  instance: WorkflowInstance;
  stages: StageInstance[];
}

export const workflowApi = {
  getGarmentWorkflow: async (garmentId: string) => {
    const { data } = await apiClient.get<GarmentWorkflowResponse>(`/garments/${garmentId}/workflow`);
    return data;
  },
  
  reportStageCompletion: async (params: { garmentId: string; stageId: string; evidencePhotoUrls?: string[] }) => {
    const { data } = await apiClient.post('/workflows/stages/complete', params);
    return data;
  },

  getTemplates: async () => {
    const { data } = await apiClient.get<any[]>('/workflow-templates');
    return data;
  }
};
