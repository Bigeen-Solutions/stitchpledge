import { apiClient } from '../../api/client.ts';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  garmentName: string;
  deadline: string;
  riskLevel: 'ON_TRACK' | 'AT_RISK' | 'OVERDUE';
  isUrgent: boolean;
  status: string;
}

export interface CapacityStatus {
  isOverCapacity: boolean;
  message: string;
}

export interface OrdersResponse {
  items: Order[];
  total: number;
  page: number;
  totalPages: number;
  capacityWarning: boolean;
}

export const ordersApi = {
  getOrders: async (page = 1, limit = 10) => {
    const { data } = await apiClient.get<OrdersResponse>('/orders', {
      params: { page, limit }
    });
    return data;
  },
  
  getCapacityStatus: async () => {
    const { data } = await apiClient.get<CapacityStatus>('/orders/capacity-status');
    return data;
  },

  getOrderDetail: async (id: string) => {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  }
};
