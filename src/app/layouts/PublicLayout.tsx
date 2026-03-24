import { Outlet, Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../../features/auth/auth.store"

export function PublicLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  // If still loading, don't redirect yet
  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isAuthenticated && location.pathname !== '/') {
    return <Navigate to="/dashboard" replace />
  }


  return (
    <main className="public-layout">
      <Outlet />
    </main>
  )
}
