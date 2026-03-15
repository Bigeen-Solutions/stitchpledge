import { apiClient } from '../../api/client';

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
  getMaterialsLedger: async (orderId: string) => {
    const { data } = await apiClient.get<MaterialEntry[]>(`/orders/${orderId}/materials/ledger`);
    return data;
  },
  
  adjustMaterial: async (orderId: string, data: { delta: number, reason: string }) => {
    await apiClient.post(`/orders/${orderId}/materials/adjust`, data);
  }
};
