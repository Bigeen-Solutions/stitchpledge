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
};
