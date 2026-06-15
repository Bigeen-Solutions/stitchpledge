import { apiClient } from '../../infrastructure/http/axios.client';

export type FittingOutcome = 'passed' | 'adjustments_required' | 'no_show' | 'cancelled';

export interface FittingAppointment {
  id: string;
  orderId: string;
  garmentId: string;
  scheduledAt: string;
  notes: string | null;
  outcome: FittingOutcome | null;
  createdAt: string;
}

export const fittingsApi = {
  list: async (orderId: string): Promise<FittingAppointment[]> => {
    const { data } = await apiClient.get<FittingAppointment[]>(
      `/orders/${orderId}/fittings`,
    );
    return data;
  },

  create: async (
    orderId: string,
    body: { garmentId: string; scheduledAt: string; notes?: string },
  ): Promise<FittingAppointment> => {
    const { data } = await apiClient.post<FittingAppointment>(
      `/orders/${orderId}/fittings`,
      body,
    );
    return data;
  },

  recordOutcome: async (
    orderId: string,
    appointmentId: string,
    body: { outcome: FittingOutcome; notes?: string },
  ): Promise<FittingAppointment> => {
    const { data } = await apiClient.patch<FittingAppointment>(
      `/orders/${orderId}/fittings/${appointmentId}/outcome`,
      body,
    );
    return data;
  },
};
