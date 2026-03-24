import { apiClient } from "../../api/client.ts";

export interface RecentOrderRow {
  id: string;
  customerName: string;
  garmentName: string;
  createdAt: string;
  riskLevel: "ON_TRACK" | "AT_RISK" | "OVERDUE" | "UNKNOWN";
}

export interface ActivityItem {
  text: string;
  detail: string;
  time: string;
  color?: string;
  icon?: any;
}

export interface MaterialStock {
  name: string;
  level: number;
  color: string;
}

export interface AnalyticsOverview {
  totalActiveOrders: number;
  highRiskGarments: number;
  tasksByStage: Record<string, number>;
  recentOrders: RecentOrderRow[];
  activityFeed: ActivityItem[];
  materialStock: MaterialStock[];
}

export const analyticsApi = {
  getOverview: async () => {
    const { data } = await apiClient.get<AnalyticsOverview>("/analytics/overview");
    return data;
  },
};
