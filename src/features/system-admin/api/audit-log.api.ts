import { apiClient } from '../../../infrastructure/http/axios.client'
import type { AdminAuditEntry } from '../types'

export const auditLogApi = {
  list: async (params?: { page?: number; limit?: number }): Promise<AdminAuditEntry[]> => {
    const { data } = await apiClient.get<AdminAuditEntry[]>('/system-admin/audit-log', { params })
    return data
  },
}
