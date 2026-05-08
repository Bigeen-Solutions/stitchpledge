import React from 'react'
import { useAuthStore } from '../../auth/auth.store'

interface Props {
  children: React.ReactNode
}

/**
 * SystemAdminGuard
 * Renders children only when the authenticated user has role SYSTEM_ADMIN.
 * Returns null for ANY other condition — no redirect, no error message.
 * This prevents route discovery via redirect patterns.
 */
export function SystemAdminGuard({ children }: Props) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return null
  if (!user || user.role !== 'SYSTEM_ADMIN') return null

  return <>{children}</>
}
