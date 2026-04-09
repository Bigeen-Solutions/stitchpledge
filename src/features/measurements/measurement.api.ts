import { apiClient } from '../../infrastructure/http/axios.client';

export interface MeasurementVersion {
  id: string;
  actor: string;
  version: number;
  timestamp: string;
  changes: string;
  values: Record<string, number | string>;
}

export const measurementApi = {
  getMeasurements: async (customerId: string) => {
    const { data } = await apiClient.get<MeasurementVersion[]>(`/customers/${customerId}/measurements`);
    return data;
  },
  
  recordMeasurement: async (customerId: string, measurements: Record<string, number>) => {
    await apiClient.post(`/customers/${customerId}/measurements`, { measurements });
  }
};

