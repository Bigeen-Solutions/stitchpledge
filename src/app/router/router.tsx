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
import { ServerErrorPage } from '../../pages/error/ServerErrorPage.tsx';


import { CustomerPortalLayout } from '../../features/customer/layouts/CustomerPortalLayout.tsx';
import { CustomerOrderPage } from '../../features/customer/pages/CustomerOrderPage.tsx';
import { ProtectedRoute } from '../../features/auth/ProtectedRoute.tsx';
import { useAxiosInterceptors } from '../../infrastructure/http/use-axios-interceptors.ts';

import { DesignSystemPage } from '../../pages/DesignSystemPage.tsx';

import { SplashScreen } from '../../pages/SplashScreen.tsx';

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
          { path: '/design-system', element: <DesignSystemPage /> },
        ],
      },
      {
        element: (
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: '/dashboard',
            element: (
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/orders',
            element: (
              <ProtectedRoute requiredPermission="orders:read">
                <OrdersPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/orders/new',
            element: (
              <ProtectedRoute requiredPermission="orders:write">
                <NewOrderPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/orders/:id',
            element: (
              <ProtectedRoute requiredPermission="orders:read">
                <OrderDetailPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/staff',
            element: (
              <ProtectedRoute requiredPermission="staff:read">
                <StaffManagementPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/customers',
            element: (
              <ProtectedRoute requiredPermission="orders:read">
                <CustomersPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/customers/:id',
            element: (
              <ProtectedRoute requiredPermission="orders:read">
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
              <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'STORE_MANAGER']}>
                <InventoryPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/settings',
            element: (
              <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'STORE_MANAGER']}>
                <SettingsPage />
              </ProtectedRoute>
            )
          },
          {
            path: '/reports/audit',
            element: (
              <ProtectedRoute allowedRoles={['COMPANY_ADMIN']}>
                <AuditLogPage />
              </ProtectedRoute>
            )
          },
        ],
      },
      {
        element: (
          <ProtectedRoute requiredPermission="customer:portal">
            <CustomerPortalLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: '/portal/orders/:id', element: <CustomerOrderPage /> },
        ],
      },
      { path: '/403', element: <ForbiddenPage /> },
      { path: '/404', element: <NotFoundPage /> },
      { path: '/500', element: <ServerErrorPage /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);
