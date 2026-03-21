import { apiClient } from "../../api/client.ts";

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
}

export const customersApi = {
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
