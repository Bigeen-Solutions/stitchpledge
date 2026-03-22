import axios from "axios"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "../../features/auth/auth.store"
import { parseApiError } from "../../lib/errors/parse-api-error"
import { useToastStore } from "../../components/feedback/Toast"

// Helper for queuing requests during refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token)
    } else {
      prom.reject(error)
    }
  })

  failedQueue = []
}

// Create the centralized Axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Required for HttpOnly cookies
})

// Request Interceptor: Attach Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response Interceptor: 401 Recovery & Error Parsing
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // 1. Handle 401 Unauthorized (Session Expired or Missing)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to refresh the token
        // Use axios directly to avoid interceptor recursion if refresh fails with 401
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        )

        const { accessToken, user } = response.data
        useAuthStore.getState().setAuth(accessToken, user)

        processQueue(null, accessToken)
        isRefreshing = false

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        useAuthStore.getState().clearAuth()

        // Redirect to login if not already there
        if (window.location.pathname !== "/login") {
          window.location.href = "/login"
        }

        return Promise.reject(refreshError)
      }
    }

    // 2. Handle 403 Forbidden (Valid Token, Insufficient Permissions)
    if (error.response?.status === 403) {
      useToastStore.getState().showToast("Access Denied: You do not have permission for this area", "error")
      
      if (window.location.pathname !== "/dashboard" && window.location.pathname !== "/login") {
        window.location.href = "/dashboard"
      }
      return Promise.reject(error)
    }

    // 3. Attach parsed error for all other failures
    const parsedError = parseApiError(error)
    ;(error as any).parsedError = parsedError

    return Promise.reject(error)
  },
)
