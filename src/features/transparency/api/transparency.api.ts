import { axiosInstance } from '../../../infrastructure/http/axios-instance';
import { useAuthStore } from '../../auth/auth.store';

export type UiHint = 'GREEN' | 'AMBER' | 'RED';

export interface VisibilityBundle {
  summary: {
    uiHint: UiHint;
    displayStatus: string;
  };
  capacity: {
    status: string;
    utilization?: number;
  };
  trust: {
    status: string;
    reason?: string;
  };
  forensics: {
    status: string;
    lastSealAt: string;
  };
  syncedAt: string;
}

export const transparencyApi = {
  getStoreStatus: async (storeId: string): Promise<VisibilityBundle> => {
    const response = await axiosInstance.get(`/transparency/stores/${storeId}/status`);
    return response.data;
  },
};
