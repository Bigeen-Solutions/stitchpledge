import { apiClient } from "../../infrastructure/http/axios.client";

export type UiHint = 'NOMINAL' | 'CAUTION' | 'DEGRADED' | 'CRITICAL' | 'COMPROMISED';
export type CapacityStatus = 'OPTIMAL' | 'HEAVY' | 'CRITICAL' | 'LOCKED';
export type TrustStatus = 'VERIFIED' | 'UNDER_REVIEW' | 'FROZEN' | 'HIDDEN';
export type ForensicStatus = 'SEALED' | 'COMPROMISED' | 'MAINTENANCE';

export interface VisibilityBundleDTO {
  capacity: {
    status: CapacityStatus;
    utilization?: number;
  };
  trust: {
    status: TrustStatus;
    reason?: string;
  };
  forensics: {
    status: ForensicStatus;
    lastSealAt: string;
  };
  uiHint: UiHint;
  syncedAt: string;
}

export const transparencyApi = {
  getStoreStatus: async (storeId: string): Promise<VisibilityBundleDTO> => {
    const response = await apiClient.get(`/transparency/stores/${storeId}/status`);
    return response.data;
  },
};
