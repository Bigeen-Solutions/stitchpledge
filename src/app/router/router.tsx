import { createBrowserRouter, Navigate } from 'react-router-dom';
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
// Removed obsolete components that were only used in the hardcoded dashboard
import { CustomerPortalLayout } from '../../features/customer/layouts/CustomerPortalLayout.tsx';
import { CustomerOrderPage } from '../../features/customer/pages/CustomerOrderPage.tsx';
import { ProtectedRoute } from '../../features/auth/ProtectedRoute.tsx';

import { DesignSystemPage } from '../../pages/DesignSystemPage.tsx';

import { SplashScreen } from '../../pages/SplashScreen.tsx';

export const router = createBrowserRouter([
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

          <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'STORE_MANAGER']}>
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
        path: '/production',
        element: <ProductionBoardPage />,
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
  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
]);
