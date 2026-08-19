import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../infrastructure/http/axios.client';

export const RiskLevel = {
  ON_TRACK: 'ON_TRACK',
  AT_RISK: 'AT_RISK',
  OVERDUE: 'OVERDUE',
} as const;

export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const StasisStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type StasisStatus = (typeof StasisStatus)[keyof typeof StasisStatus];

export interface DeadlineIntelligenceDTO {
  orderId: string;
  companyId: string;
  riskLevel: RiskLevel;
  daysRemaining: number;
  effectiveDaysRemaining: number;
  isCountdownActive: boolean;
  stasisStatus: StasisStatus;
  eventDate: string;
}

export const getDeadlineInfo = async (orderId: string): Promise<DeadlineIntelligenceDTO> => {
  const response = await apiClient.get(`/deadlines/${orderId}`);
  return response.data;
};

export const useDeadline = (orderId: string) => {
  return useQuery({
    queryKey: ['deadline', orderId],
    queryFn: () => getDeadlineInfo(orderId),
  });
};
