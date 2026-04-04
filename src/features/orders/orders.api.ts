import { apiClient } from "../../api/client.ts"

export interface Order {
  id: string
  companyId: string
  customerId: string
  customerName: string
  eventDate: string
  lockedMeasurementVersionId: string | null
  orderNumber: number // From decimal/int in database
  status: string
  garmentName: string
  deadline: string
  riskLevel: "ON_TRACK" | "AT_RISK" | "OVERDUE" | "UNKNOWN"
  isUrgent: boolean
}

export interface OrderDeadlineProjection {
  id: string
  orderId: string
  remainingDurationHours: number
  availableCapacityHours: number
  hoursUntilDeadline: number
  riskLevel: "ON_TRACK" | "AT_RISK" | "OVERDUE"
  calculatedAt: string
}

export interface OrderDetailResponse {
  order: Order
  projection: OrderDeadlineProjection
}

export interface Garment {
  id: string
  orderId: string
  storeId: string
  name: string
  status: string
  assignedTailorId?: string | null
}

export interface CapacityStatus {
  isOverCapacity: boolean
  message: string
}

export interface OrdersResponse {
  items: Order[]
  total: number
  page: number
  totalPages: number
  capacityWarning: boolean
}

export const ordersApi = {
  getOrders: async (page = 1, limit = 10) => {
    const { data } = await apiClient.get<OrdersResponse>("/orders", {
      params: { page, limit },
    })
    return data
  },

  getCapacityStatus: async () => {
    const { data } = await apiClient.get<CapacityStatus>(
      "/orders/capacity-status",
    )
    return data
  },

  getOrderDetail: async (id: string) => {
    const { data } = await apiClient.get<OrderDetailResponse>(`/orders/${id}`)
    return data
  },

  getOrderGarments: async (id: string) => {
    const { data } = await apiClient.get<Garment[]>(`/orders/${id}/garments`)
    return data
  },

  createOrder: async (data: any) => {
    const { data: result } = await apiClient.post("/orders", data)
    return result
  },

  assignTailor: async (garmentId: string, tailorId: string | null) => {
    const { data } = await apiClient.patch(`/garments/${garmentId}/assign`, {
      tailorId,
    })
    return data
  },
}
