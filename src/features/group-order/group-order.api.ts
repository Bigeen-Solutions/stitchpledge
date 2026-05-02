import { apiClient } from "../../infrastructure/http/axios.client";

export type RiskLevel = "ON_TRACK" | "AT_RISK" | "OVERDUE";

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
  // Public endpoint
  const response = await apiClient.get(`/public/group/${token}`);
  return response.data;
};
