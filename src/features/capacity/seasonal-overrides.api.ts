import { apiClient } from '../../infrastructure/http/axios.client';

export interface SeasonalOverride {
  id: string;
  label: string;
  capacityLimit: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface CreateSeasonalOverrideBody {
  label: string;
  capacity_limit: number;
  starts_at: string;
  ends_at: string;
}

export const seasonalOverridesApi = {
  list: async (): Promise<SeasonalOverride[]> => {
    const { data } = await apiClient.get<SeasonalOverride[]>('/capacity/seasonal-overrides');
    return data;
  },

  create: async (body: CreateSeasonalOverrideBody): Promise<SeasonalOverride> => {
    const { data } = await apiClient.post<SeasonalOverride>('/capacity/seasonal-overrides', body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/capacity/seasonal-overrides/${id}`);
  },
};
