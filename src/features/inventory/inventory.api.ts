import { apiClient } from '../../infrastructure/http/axios.client';

export interface StockPosition {
  materialId: string;
  name: string;
  sku: string | null;
  unit: string;
  imageUrl?: string;
  totalLedger: number;
  activeReservations: number;
  quantityAvailable: number;
}

export const inventoryApi = {
  getInventoryOverview: async () => {
    const { data } = await apiClient.get<StockPosition[]>('/inventory');
    return data;
  },

  receiveShipment: async (materialId: string, quantity: number, notes: string) => {
    const { data } = await apiClient.post(`/inventory/${materialId}/receive`, {
      quantity,
      notes
    });
    return data;
  },

  registerMaterial: async (data: FormData | { name: string; sku: string | null; canonicalUnit: string }) => {
    const { data: result } = await apiClient.post('/inventory/materials', data);
    return result;
  }
};
