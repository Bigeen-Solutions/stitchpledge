import { apiClient } from '../../api/client.ts';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  garmentName: string;
  deadline: string;
  riskLevel: 'ON_TRACK' | 'AT_RISK' | 'OVERDUE';
  status: string;
}

export interface CapacityStatus {
  isOverCapacity: boolean;
  message: string;
}

export const ordersApi = {
  getOrders: async () => {
    const { data } = await apiClient.get<Order[]>('/orders');
    return data;
  },
  
  getCapacityStatus: async () => {
    const { data } = await apiClient.get<CapacityStatus>('/orders/capacity-status');
    return data;
  },

  getOrderDetail: async (id: string) => {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  },
  
  completeStage: async (orderId: string, stageId: string) => {
    await apiClient.post(`/orders/${orderId}/workflow/stages/${stageId}/complete`);
  }
};
