import { apiClient } from '../../infrastructure/http/axios.client';

export interface CapacityCheckResult {
  canAccept: boolean;
  currentLoad: number;
  maxCapacity: number;
  utilizationPercent: number;
  message?: string;
}

export const storesApi = {
  checkCapacity: async (storeId: string): Promise<CapacityCheckResult> => {
    const { data } = await apiClient.post<CapacityCheckResult>(`/stores/${storeId}/capacity-check`);
    return data;
  },
};
