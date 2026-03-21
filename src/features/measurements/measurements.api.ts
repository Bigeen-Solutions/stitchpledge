import { apiClient } from "../../api/client.ts";

export interface MeasurementVersion {
  id: string;
  customerId: string;
  versionNumber: number;
  measurements: Record<string, number>;
  createdAt: string;
}

export const measurementsApi = {
  createMeasurement: async (data: {
    customerId: string;
    measurements: Record<string, number>;
  }): Promise<MeasurementVersion> => {
    const response = await apiClient.post<MeasurementVersion>("/measurements", data);
    return response.data;
  },
};
