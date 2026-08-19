import { apiClient } from '../../../infrastructure/http/axios.client'
import type { OverviewStats } from '../types'

export const statsApi = {
  getStats: async (): Promise<OverviewStats> => {
    const { data } = await apiClient.get<OverviewStats>('/system-admin/stats')
    return data
  },
}
