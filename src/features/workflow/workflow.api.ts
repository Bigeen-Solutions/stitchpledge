import { apiClient } from '../../infrastructure/http/axios.client';

export interface WorkflowTemplate {
  id: string;
  companyId: string;
  name: string;
  requiredMeasurements: string[];
  createdAt: string;
}

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

export interface ActiveFloorTask {
  stageInstanceId: string;
  stageId: string;
  stageName: string;
  garmentId: string;
  garmentName: string;
  assignedTailorId?: string | null;
  orderId: string;
  customerName: string;
  deadline: string;
  riskLevel: 'ON_TRACK' | 'AT_RISK' | 'OVERDUE';
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
    const { data } = await apiClient.get<WorkflowTemplate[]>('/workflow-templates');
    return data;
  },

  createTemplate: async (name: string) => {
    const { data } = await apiClient.post<WorkflowTemplate>('/workflows/templates', { name });
    return data;
  },

  getActiveTasks: async (): Promise<ActiveFloorTask[]> => {
    const { data } = await apiClient.get<ActiveFloorTask[]>('/workflows/tasks/active');
    return data;
  },

  updateTemplateMeasurements: async (templateId: string, measurements: string[]) => {
    const { data } = await apiClient.put(`/workflows/templates/${templateId}/measurements`, {
      measurements
    });
    return data;
  }
};
