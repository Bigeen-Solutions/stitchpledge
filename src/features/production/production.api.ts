import { axiosInstance } from '../../infrastructure/api/axios-instance';

export interface TransitionResult {
  success: boolean;
  newStatus?: string;
  rejectionBundle?: {
    code: string;
    message: string;
    missingRequirementIds?: string[];
  };
}

export const productionApi = {
  getAvailableTransitions: async (garmentId: string): Promise<string[]> => {
    const response = await axiosInstance.get(`/production/garments/${garmentId}/transitions`);
    return response.data;
  },

  attemptTransition: async (
    garmentId: string, 
    targetStatus: string, 
    idempotencyKey: string
  ): Promise<TransitionResult> => {
    const response = await axiosInstance.patch(`/production/garments/${garmentId}/status`, {
      targetStatus,
      idempotencyKey
    });
    return response.data;
  }
};
