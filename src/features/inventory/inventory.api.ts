import { apiClient } from '../../infrastructure/http/axios.client';

export interface StockPosition {
  materialId: string;
  name: string;
  unit: string;
  totalLedger: number;
  activeReservations: number;
  quantityAvailable: number;
}

export const inventoryApi = {
  getInventoryOverview: async () => {
    const { data } = await apiClient.get<StockPosition[]>('/inventory');
    return data;
  }
};
