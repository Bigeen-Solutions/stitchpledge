import { apiClient } from "../../infrastructure/http/axios.client";

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
    const response = await apiClient.get(`/production/garments/${garmentId}/transitions`);
    return response.data;
  },

  attemptTransition: async (
    garmentId: string,
    targetStatus: string,
    idempotencyKey: string,
    bypassReason?: string,
  ): Promise<TransitionResult> => {
    const response = await apiClient.patch(`/production/garments/${garmentId}/status`, {
      targetStatus,
      idempotencyKey,
      ...(bypassReason ? { bypass_reason: bypassReason } : {}),
    });
    return response.data;
  }
};
