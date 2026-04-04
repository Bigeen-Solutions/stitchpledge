import { apiClient } from '../../infrastructure/http/axios.client';

export interface MaterialEntry {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  quantityDelta?: number;
  reason?: string;
  imgUrl?: string;
}

export const materialsApi = {
  getMaterialsLedger: async (garmentId: string) => {
    const { data } = await apiClient.get<MaterialEntry[]>(`/garments/${garmentId}/materials`);
    return data;
  },
  
  adjustMaterial: async (garmentId: string, data: { delta: number, reason: string }) => {
    await apiClient.post(`/garments/${garmentId}/materials`, data);
  }
};

