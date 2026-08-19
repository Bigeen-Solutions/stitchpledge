import { useQuery } from '@tanstack/react-query'
import { auditLogApi } from '../api/audit-log.api'

export function useAdminAuditLog(page: number, limit = 50) {
  return useQuery({
    queryKey: ['system-admin', 'audit-log', page, limit],
    queryFn: () => auditLogApi.list({ page, limit }),
    staleTime: 1000 * 30,
  })
}
