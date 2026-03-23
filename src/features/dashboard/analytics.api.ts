import { apiClient } from "../../api/client.ts";

export interface RecentOrderRow {
  id: string;
  customerName: string;
  garmentName: string;
  createdAt: string;
  riskLevel: "ON_TRACK" | "AT_RISK" | "OVERDUE" | "UNKNOWN";
}

export interface AnalyticsOverview {
  totalActiveOrders: number;
  highRiskGarments: number;
  tasksByStage: Record<string, number>;
  recentOrders: RecentOrderRow[];
}

export const analyticsApi = {
  getOverview: async () => {
    const { data } = await apiClient.get<AnalyticsOverview>("/analytics/overview");
    return data;
  },
};
