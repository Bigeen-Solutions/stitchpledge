import { apiClient } from '../../../infrastructure/http/axios.client'
import type { StoreRecord, AddStoreDTO } from '../types'

export const storesApi = {
  listByCompany: async (companyId: string): Promise<StoreRecord[]> => {
    const { data } = await apiClient.get<StoreRecord[]>(
      `/system-admin/companies/${companyId}/stores`,
    )
    return data
  },

  add: async (companyId: string, dto: AddStoreDTO): Promise<void> => {
    await apiClient.post(`/system-admin/companies/${companyId}/stores`, dto)
  },
}
