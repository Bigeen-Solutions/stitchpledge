import { apiClient } from '../../infrastructure/http/axios.client';

export interface MeasurementVersion {
  id: string;
  actor: string;
  versionNumber: number;
  timestamp: string;
  changes: string;
  values: Record<string, number | string>;
}

export const measurementApi = {
  getMeasurements: async (customerId: string) => {
    const { data } = await apiClient.get<MeasurementVersion[]>(`/customers/${customerId}/measurements`);
    return data;
  },
  
  recordMeasurement: async (customerId: string, measurements: Record<string, number>, status?: 'draft' | 'complete'): Promise<MeasurementVersion> => {
    const { data } = await apiClient.post<MeasurementVersion>(`/customers/${customerId}/measurements`, { measurements, status });
    return data;
  }
};

