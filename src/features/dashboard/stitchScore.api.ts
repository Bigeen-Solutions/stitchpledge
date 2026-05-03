import { api } from '../../api/client';

export interface StitchScoreDTO {
  score: number | null;
  status: 'INSUFFICIENT_DATA' | 'QUALIFYING' | 'ACTIVE';
  thresholdProgress: number;
  isFoundingMember: boolean;
  breakdown: {
    onTimeRate: number | null;
    integrityRate: number | null;
    loyaltyRate: number | null;
  };
}

export const stitchScoreApi = {
  getScore: async (companyId: string): Promise<StitchScoreDTO> => {
    const { data } = await api.get(`/companies/${companyId}/stitch-score`);
    return data;
  },
};
