import { apiClient } from '../../api/client';

export interface CustomerOrderProjection {
  id: string;
  orderNumber: string;
  customerName: string;
  garmentType: string;
  status: string;
  riskLevel: 'ON_TRACK' | 'AT_RISK' | 'OVERDUE';
  estimatedCompletion: string;
  deadline: string;
  activeStageIndex: number;
  isWarning: boolean;
  stages: {
    id: string;
    name: string;
    status: string;
    isComplete: boolean;
    isActive: boolean;
  }[];
}

export const customerApi = {
  getCustomerOrder: async (orderId: string) => {
    const { data } = await apiClient.get<CustomerOrderProjection>(`/portal/orders/${orderId}`);
    return data;
  }
};
