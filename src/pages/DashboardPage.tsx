import React from 'react';
import { useAuthStore } from '../features/auth/auth.store';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../features/dashboard/analytics.api';
import { keys } from '../query/keys';

import { AdminDashboard } from './dashboard/AdminDashboard';
import { TailorDashboard } from './dashboard/TailorDashboard';
import { TailorDashboardEmpty } from './dashboard/TailorDashboardEmpty';
import { ClientDashboard } from './dashboard/ClientDashboard';
import { Box, CircularProgress } from '@mui/material';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const role = user?.role;

  const { data, isLoading } = useQuery({
    queryKey: keys.analytics.overview,
    queryFn: analyticsApi.getOverview,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#1e5c3a' }} />
      </Box>
    );
  }

  const hasOrders = (data?.totalActiveOrders || 0) > 0;

  // Role names from auth.types.ts: 'COMPANY_ADMIN' | 'STORE_MANAGER' | 'TAILOR' | 'CUSTOMER'
  
  if (role === 'TAILOR' || role === 'STORE_MANAGER') {
    if (!hasOrders) return <TailorDashboardEmpty />;
    return <TailorDashboard />;
  }

  if (role === 'COMPANY_ADMIN') {
    return <AdminDashboard />;
  }

  if (role === 'CUSTOMER') {
    return <ClientDashboard />;
  }

  // Fallback or unauthorized
  return <TailorDashboardEmpty />;
};
