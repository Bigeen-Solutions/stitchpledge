import { apiClient } from "../../api/client.ts";

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface CustomerSummary extends Customer {
  totalOrders: number;
  lastOrderDate: string | null; // ISO string from API
}

export interface CustomerListResponse {
  items: CustomerSummary[];
  total: number;
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
}

export interface MeasurementSummary {
  id: string;
  versionNumber: number;
  measurements: Record<string, number>;
  createdAt: string;
}

export interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
}

export interface CustomerProfile {
  customer: Customer;
  latestMeasurement: MeasurementSummary | null;
  orderHistory: OrderHistoryItem[];
}

export const customersApi = {
  getCustomers: async (page = 1, limit = 10, search?: string): Promise<CustomerListResponse> => {
    const response = await apiClient.get<CustomerListResponse>("/customers", {
      params: { page, limit, search },
    });
    return response.data;
  },

  searchCustomers: async (query: string): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>("/customers/search", {
      params: { q: query },
    });
    return response.data;
  },

  createCustomer: async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await apiClient.post<Customer>("/customers", data);
    return response.data;
  },

  getCustomerProfile: async (id: string): Promise<CustomerProfile> => {
    const response = await apiClient.get<CustomerProfile>(`/customers/${id}`);
    return response.data;
  },

  updateMeasurements: async (id: string, measurements: Record<string, number>): Promise<MeasurementSummary> => {
    const response = await apiClient.post<MeasurementSummary>(`/customers/${id}/measurements`, {
      measurements,
    });
    return response.data;
  },
};
