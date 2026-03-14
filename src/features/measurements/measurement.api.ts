import { apiClient } from '../../api/client';

export interface MeasurementVersion {
  id: string;
  actor: string;
  version: number;
  timestamp: string;
  changes: string;
  values: Record<string, number | string>;
}

export const measurementApi = {
  getMeasurements: async (orderId: string) => {
    const { data } = await apiClient.get<MeasurementVersion[]>(`/orders/${orderId}/measurements`);
    return data;
  },
  
  recordMeasurement: async (orderId: string, data: any) => {
    await apiClient.post(`/orders/${orderId}/measurements`, data);
  }
};
