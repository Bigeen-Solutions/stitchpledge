import { useEffect, useRef } from "react"
import { useAuthStore } from "./auth.store"
import { refreshApi } from "./auth.api"

/**
 * Hook to be called ONCE in App.tsx root.
 * Handles the silent refresh lifecycle on application boot.
 */
export function useSilentRefresh() {
  const { setAuth, clearAuth, setLoading } = useAuthStore()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    setLoading(true)
    refreshApi()
      .then(({ accessToken, user }) => {
        setAuth(accessToken, user)
      })
      .catch(() => {
        clearAuth() // Silent failure — user stays logged out
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])
}
