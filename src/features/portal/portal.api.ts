// src/features/portal/portal.api.ts
import { apiClient } from "../../infrastructure/http/axios.client";

export interface Milestone {
  id: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'INHIBITED';
  completedAt: string | null;
}

export interface PortalView {
  trackingSlug: string;
  customerDisplayName: string;
  currentStatus: string;
  dignifiedNarrative: string;
  progressMilestones: Milestone[];
  lastUpdated: string;
}

export const getTrackingInfo = async (slug: string): Promise<PortalView> => {
  const response = await apiClient.get(`/portal/track/${slug}`);
  return response.data;
};
