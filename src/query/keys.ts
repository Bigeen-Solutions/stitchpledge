export const keys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (page: number, limit: number) => ['orders', 'list', { page, limit }] as const,
    detail: (id: string) => ['orders', id] as const,
    deadlineRisk: (id: string) => ['orders', id, 'risk'] as const,
    garments: (id: string) => ['orders', id, 'garments'] as const,
  },
  garments: {
    detail: (id: string) => ['garments', id] as const,
  },
  measurements: {
    list: (customerId: string) => ['measurements', customerId] as const,
  },
  materials: {
    ledger: (orderId: string) => ['materials', orderId] as const,
  },
  workflow: {
    stages: (orderId: string) => ['workflow', orderId, 'stages'] as const,
    garment: (garmentId: string) => ['workflow', 'garment', garmentId] as const,
    templates: ['workflow', 'templates'] as const,
    activeTasks: ['workflow', 'active-tasks'] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: (storeId?: string) => ['staff', 'list', { storeId }] as const,
  },
  analytics: {
    overview: ['analytics', 'overview'] as const,
    admin: ['analytics', 'admin'] as const,
  },
  customers: {
    list: (page: number, limit: number, search?: string) => ['customers', 'list', { page, limit, search }] as const,
    search: (query: string) => ['customers', 'search', query] as const,
    detail: (id: string) => ['customers', 'profile', id] as const,
  },
};
