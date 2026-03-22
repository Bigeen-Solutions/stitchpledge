import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { useAuthStore } from "./auth.store"

// Mock child component
const ProtectedContent = () => <div>Protected Content</div>
const LoginPage = () => <div>Login Page</div>
const NotFoundPage = () => <div>404 Not Found</div>

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it("renders loading skeleton when isLoading is true", () => {
    useAuthStore.setState({ isLoading: true })
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      </MemoryRouter>,
    )
    expect(screen.getByText(/Loading StitchFlow/i)).toBeInTheDocument()
  })

  it("redirects to /login when unauthenticated", () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText("Login Page")).toBeInTheDocument()
  })

  it("renders children when authenticated and no permission is required", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { role: "TAILOR", permissions: [] } as any,
    })
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <ProtectedContent />
        </ProtectedRoute>
      </MemoryRouter>,
    )
    expect(screen.getByText("Protected Content")).toBeInTheDocument()
  })

  it("redirects to /404 when required permission is missing", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { role: "TAILOR", permissions: ["orders:read"] } as any,
    })
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredPermission="staff:read">
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
          <Route path="/404" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText("404 Not Found")).toBeInTheDocument()
  })

  it("renders children when user has required permission", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { role: "MANAGER", permissions: ["staff:read"] } as any,
    })
    render(
      <MemoryRouter>
        <ProtectedRoute requiredPermission="staff:read">
          <ProtectedContent />
        </ProtectedRoute>
      </MemoryRouter>,
    )
    expect(screen.getByText("Protected Content")).toBeInTheDocument()
  })
})
