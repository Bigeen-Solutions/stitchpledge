import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './auth.store';
import { usePermissions } from './use-permissions';
import type { Permission, StitchfynRole } from './auth.types';

interface ProtectedRouteProps {
  requiredPermission?: Permission;
  allowedRoles?: StitchfynRole[];
  children: React.ReactNode;
}

/**
 * Route guard component for React Router.
 * Handles loading states, authentication, and RBAC.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  allowedRoles,
  children,
}) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { can } = usePermissions();
  const location = useLocation();

  // 1. App-wide silent refresh in progress
  if (isLoading) {
    return (
      <div className="full-screen-skeleton">
        <div className="loading-spinner">Loading Stitchfyn...</div>
      </div>
    );
  }

  // 2. Not authenticated — send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated but missing specific permission — treat as 404
  if (requiredPermission && !can(requiredPermission)) {
    return <Navigate to="/404" replace />;
  }

  // 4. Authenticated but wrong role — cleanly intercept at router level
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'TAILOR' ? '/production' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  // 5. Authorized — render children
  return <>{children}</>;
};
