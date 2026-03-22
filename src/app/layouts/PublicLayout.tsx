import { Outlet, Navigate } from "react-router-dom"
import { useAuthStore } from "../../features/auth/auth.store"

export function PublicLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()

  // If still loading, don't redirect yet
  if (isLoading) {
    return <div>Loading...</div> // Or a proper loading component
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <main className="public-layout">
      <Outlet />
    </main>
  )
}
