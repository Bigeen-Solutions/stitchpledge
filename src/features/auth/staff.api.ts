import { apiClient } from "../../api/client.ts";

export interface Staff {
  id: string;
  email: string;
  role: "COMPANY_ADMIN" | "STORE_MANAGER" | "TAILOR" | "FRONT_DESK" | "CUSTOMER";
  storeId: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface InviteStaffRequest {
  email: string;
  role: string;
  storeId: string;
  initialPassword: string;
}

export interface Store {
  id: string;
  name: string;
}

export const staffApi = {
  getStaff: async (storeId?: string): Promise<Staff[]> => {
    const response = await apiClient.get<Staff[]>("/staff", {
      params: { storeId }
    });
    return response.data;
  },

  inviteStaff: async (data: InviteStaffRequest): Promise<Staff> => {
    const response = await apiClient.post<Staff>("/staff/invite", data);
    return response.data;
  },

  updateStaffStatus: async (id: string, isActive: boolean): Promise<void> => {
    await apiClient.put(`/staff/${id}/status`, { isActive });
  },

  getStores: async (): Promise<Store[]> => {
    const response = await apiClient.get<Store[]>("/stores");
    return response.data;
  },
};
