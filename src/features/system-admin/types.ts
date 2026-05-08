// src/features/system-admin/types.ts
// Frontend type mirrors for the system-admin backend domain

export type SubscriptionTier = 'TRIAL' | 'STARTER' | 'PROFESSIONAL'
export type CompanyStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'

export interface CompanyRecord {
  id: string
  companyName: string
  subscriptionTier: SubscriptionTier
  subscriptionStatus: CompanyStatus
  trialEndsAt: string | null
  country: string
  internalNotes: string | null
  deactivatedAt: string | null
  createdAt: string
}

export interface CompanyListRecord extends CompanyRecord {
  ownerEmail: string | null
  storeCount: number
  userCount: number
}

export interface CompanyProvisionResult {
  company: CompanyRecord
  ownerUser: {
    id: string
    email: string
    fullName: string
    temporaryPassword: string
  }
  defaultStore: {
    id: string
    storeName: string
  }
}

export interface UserRecord {
  id: string
  email: string
  fullName: string
  role: string
  companyId: string | null
  companyName: string | null
  isActive: boolean
  createdAt: string
}

export interface StoreRecord {
  id: string
  name: string
  createdAt: string
}

export interface OverviewStats {
  totalCompanies: number
  byStatus: Record<CompanyStatus, number>
  totalUsers: number
  totalStores: number
  expiringTrials: Array<{
    companyId: string
    companyName: string
    trialEndsAt: string
    daysRemaining: number
  }>
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateCompanyDTO {
  companyName: string
  ownerEmail: string
  ownerFullName: string
  subscriptionTier: SubscriptionTier
  trialEndsAt?: string
  country?: string
  notes?: string
}

export interface ChangeCompanyStatusDTO {
  status: CompanyStatus
  notes?: string
}

export interface AssignUserDTO {
  email: string
  fullName?: string
  role: 'OWNER' | 'MANAGER' | 'TAILOR'
  acknowledgeOwnerDowngrade?: boolean
}

export interface AddStoreDTO {
  storeName: string
  isDefault?: boolean
  address?: string
}
