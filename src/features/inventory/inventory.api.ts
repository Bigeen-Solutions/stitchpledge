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
    const isFormData = data instanceof FormData;
    const { data: result } = await apiClient.post('/inventory/materials', data, 
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    );
    return result;
  },

  updateMaterialImage: async (materialId: string, formData: FormData): Promise<{ imageUrl: string }> => {
    const { data } = await apiClient.patch<{ imageUrl: string }>(
      `/inventory/materials/${materialId}/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  }
};

