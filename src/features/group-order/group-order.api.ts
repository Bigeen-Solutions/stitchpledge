import { apiClient } from "../../infrastructure/http/axios.client";

export type RiskLevel = "ON_TRACK" | "AT_RISK" | "OVERDUE";

export interface GroupOrderListItem {
  id: string;
  name: string;
  eventDate: string;
  groupToken: string;
  companyId: string;
}

export interface GroupOrdersListResponse {
  items: GroupOrderListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateGroupOrderDTO {
  name: string;
  eventDate: string;
  coordinatorId?: string;
}

export interface GroupMemberProjection {
  orderId: string;
  memberName: string;
  displayStage: string;
  riskLevel: RiskLevel;
  isReady: boolean;
  pendingVerifications: string[];
  completionPercentage: number;
  lastUpdatedAt: string;
}

export interface GroupHealthProjection {
  metadata: {
    groupId: string;
    groupName: string;
    eventDate: string;
    coordinatorName: string;
    groupToken: string;
  };
  aggregatedHealth: {
    collectiveRiskLevel: RiskLevel;
    collectiveProgressPercent: number;
    totalMemberCount: number;
    completedMemberCount: number;
    atRiskMemberCount: number;
  };
  memberDetails: GroupMemberProjection[];
}

export const getGroupProjection = async (token: string): Promise<GroupHealthProjection> => {
  const response = await apiClient.get(`/public/group/${token}`);
  return response.data;
};

export const groupOrderApi = {
  list: async (page = 1, limit = 20): Promise<GroupOrdersListResponse> => {
    const { data } = await apiClient.get("/group-orders", { params: { page, limit } });
    return data;
  },
  create: async (dto: CreateGroupOrderDTO): Promise<void> => {
    await apiClient.post("/group-orders", dto);
  },
  associateOrder: async (groupId: string, orderId: string, customerName: string): Promise<void> => {
    await apiClient.post(`/group-orders/${groupId}/associate`, { orderId, customerName });
  },
};
