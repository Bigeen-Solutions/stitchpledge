import { useQuery } from '@tanstack/react-query'
import { keys } from '../../../query/keys'
import { statsApi } from '../api/stats.api'

export function useSystemAdminStats() {
  return useQuery({
    queryKey: keys.systemAdmin.stats,
    queryFn: statsApi.getStats,
    staleTime: 1000 * 60,
  })
}
