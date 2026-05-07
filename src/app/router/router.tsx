import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout.tsx';
import { ProtectedLayout } from '../layouts/ProtectedLayout.tsx';
import { LoginPage } from '../../pages/LoginPage.tsx';
import { NotFoundPage } from '../../pages/NotFoundPage.tsx';
import { OrdersPage } from '../../pages/OrdersPage.tsx';
import { OrderDetailPage } from '../../pages/OrderDetailPage.tsx';
import { StaffManagementPage } from '../../pages/StaffManagementPage.tsx';
import { NewOrderPage } from '../../pages/NewOrderPage.tsx';
import { ProductionBoardPage } from '../../pages/ProductionBoardPage.tsx';
import { DashboardPage } from '../../pages/DashboardPage.tsx';
import { CustomersPage } from '../../pages/CustomersPage.tsx';
import { ClientProfilePage } from '../../pages/ClientProfilePage.tsx';
import { InventoryPage } from '../../pages/InventoryPage.tsx';
import { SettingsPage } from '../../pages/SettingsPage.tsx';
import AuditLogPage from '../../pages/AuditLogPage.tsx';
import { ForbiddenPage } from '../../pages/error/ForbiddenPage.tsx';
import ReportsPage from '../../pages/ReportsPage.tsx';
import { TrackingPage } from '../../pages/TrackingPage.tsx';
import { DisputesPage } from '../../pages/DisputesPage.tsx';
import { SecurityAuditPage } from '../../pages/SecurityAuditPage.tsx';
import { BetaFeatureGuard } from '../../components/feedback/BetaFeatureGuard.tsx';

import { CustomerPortalLayout } from '../../features/customer/layouts/CustomerPortalLayout.tsx';
import { CustomerOrderPage } from '../../features/customer/pages/CustomerOrderPage.tsx';
import { ProtectedRoute } from '../../features/auth/ProtectedRoute.tsx';
import { useAxiosInterceptors } from '../../infrastructure/http/use-axios-interceptors.ts';

import { DesignSystemPage } from '../../pages/DesignSystemPage.tsx';

import { SplashScreen } from '../../pages/SplashScreen.tsx';
import { GroupCoordinatorDashboard } from '../../features/group-order/GroupCoordinatorDashboard.tsx';

const AxiosInterceptorHandler = () => {
  useAxiosInterceptors();
  return <Outlet />;
};

export const router = createBrowserRouter([
  {
    element: <AxiosInterceptorHandler />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <SplashScreen /> },
          { path: '/login', element: <LoginPage /> },
          { path: '/track/:slug', element: <TrackingPage /> },
          ...(import.meta.env.DEV ? [{ path: '/design-system', element: <DesignSystemPage /> }] : []),
        ],
      },
      {
        element: (
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          {
            path: '/orders',
            element: (
              <ProtectedRoute requiredPermission="MANAGE_ORDERS">
                <OrdersPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/orders/new',
            element: (
              <ProtectedRoute requiredPermission="MANAGE_ORDERS">
                <NewOrderPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/orders/:id',
            element: (
              <ProtectedRoute requiredPermission="MANAGE_ORDERS">
                <OrderDetailPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/staff',
            element: (
              <ProtectedRoute allowedRoles={['OWNER']}>
                <StaffManagementPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/customers',
            element: (
              <ProtectedRoute requiredPermission="MANAGE_ORDERS">
                <CustomersPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/customers/:id',
            element: (
              <ProtectedRoute requiredPermission="MANAGE_ORDERS">
                <ClientProfilePage />
              </ProtectedRoute>
            )
          },
          {
            path: '/production',
            element: <ProductionBoardPage />,
          },
          {
            path: '/inventory',
            element: (
              <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                <InventoryPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/settings',
            element: (
              <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                <SettingsPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/reports',
            element: (
              <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                <ReportsPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/reports/audit',
            element: (
              <ProtectedRoute allowedRoles={['OWNER']}>
                <AuditLogPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/reports/security-audit',
            element: (
              <ProtectedRoute allowedRoles={['OWNER']}>
                <SecurityAuditPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/disputes',
            element: (
              <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                <DisputesPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/measurements',
            element: <BetaFeatureGuard featureName="Measurement Vault" />
          },
          {
            path: '/payments',
            element: <BetaFeatureGuard featureName="Payment Ledger" />
          },
          {
            path: '/groups/:token',
            element: (
              // JWT guard (outer ProtectedRoute) is already enforced by the parent wrapper.
              // Capability guard ensures only users with MANAGE_ORDERS can view group dashboards.
              <ProtectedRoute requiredPermission="MANAGE_ORDERS">
                <GroupCoordinatorDashboard />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerPortalLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: '/portal/orders/:id', element: <CustomerOrderPage /> },
        ],
      },
      { path: '/403', element: <ForbiddenPage /> },
      { path: '/404', element: <NotFoundPage /> },
      // { path: '/500', element: <ServerErrorPage /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);
