import React from 'react';
import {
  Box,
  Typography,
  Card,
  Stack,
  Avatar,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Button,
  alpha,
  Divider,
} from '@mui/material';
import {
  Chat as MessageSquare,
  CalendarMonth as Calendar,
  ChevronRight,
} from '@mui/icons-material';
import { useAuthStore } from '../../features/auth/auth.store';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../features/orders/orders.api';
import { keys } from '../../query/keys';
import { analyticsApi } from '../../features/dashboard/analytics.api';

export const ClientDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: [keys.orders.list, 'my-orders'],
    queryFn: () => ordersApi.getOrders(1, 10),
  });

  const { data: analytics } = useQuery({
    queryKey: keys.analytics.overview,
    queryFn: analyticsApi.getOverview,
  });

  const activeOrders = ordersData?.items.map(order => ({
    id: order.orderNumber || order.id.split('-')[0].toUpperCase(),
    garment: order.garmentName || 'Bespoke Garment',
    stage: 2, // Defaulting for visual
    stages: ['Intake', 'Production', 'Finishing', 'Delivery'],
    estimatedDate: order.deadline || 'TBD',
  })) || [];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pb: 8 }}>
      {/* Greeting Card */}
      <Card
        sx={{
          p: 4,
          borderRadius: '24px',
          bgcolor: '#163d28',
          color: 'white',
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Avatar
          src={user?.avatarUrl}
          sx={{ width: 80, height: 80, border: '4px solid rgba(255,255,255,0.1)' }}
        />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Hello, {user?.fullName?.split(' ')[0]}
          </Typography>
          <Typography variant="body1" sx={{ color: alpha('#ffffff', 0.7) }}>
            You have {analytics?.totalActiveOrders || 0} active orders in production.
          </Typography>
        </Box>
      </Card>

      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2340', mb: 3 }}>
        Your Active Orders
      </Typography>

      <Stack spacing={3}>
        {isLoadingOrders ? (
          <Typography variant="body2" sx={{ textAlign: 'center', py: 4 }}>Loading your orders...</Typography>
        ) : activeOrders.length === 0 ? (
          <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: '#6b7280' }}>No active orders found.</Typography>
        ) : activeOrders.map((order) => (
          <Card
            key={order.id}
            sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid #e5e4e0',
              bgcolor: '#fafaf8',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#1e5c3a', transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700, letterSpacing: 1.5 }}>
                  #{order.id}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2340' }}>
                  {order.garment}
                </Typography>
              </Box>
              <Chip
                icon={<Calendar sx={{ fontSize: 14 }} />}
                label={`Estimated: ${order.estimatedDate}`}
                sx={{
                  bgcolor: alpha('#1e5c3a', 0.05),
                  color: '#1e5c3a',
                  fontWeight: 600,
                  borderRadius: '8px',
                }}
              />
            </Box>

            <Box sx={{ px: { xs: 0, md: 2 }, mb: 4 }}>
              <Stepper activeStep={order.stage} alternativeLabel>
                {order.stages.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          '&.Mui-active': { color: '#1e5c3a' },
                          '&.Mui-completed': { color: '#1e5c3a' },
                        },
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '10px' }}>
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Divider sx={{ mb: 2, borderColor: '#e5e4e0' }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                endIcon={<ChevronRight sx={{ fontSize: 18 }} />}
                sx={{ color: '#1e5c3a', fontWeight: 700, textTransform: 'none' }}
              >
                Order Details
              </Button>
            </Box>
          </Card>
        ))}
      </Stack>

      {/* Contact Section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
          Need to make a change or have a question?
        </Typography>
        <Button
          variant="contained"
          startIcon={<MessageSquare sx={{ fontSize: 20 }} />}
          sx={{
            bgcolor: '#1e5c3a',
            height: 52,
            px: 6,
            borderRadius: '999px',
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(30, 92, 58, 0.2)',
            '&:hover': { bgcolor: '#256b45', boxShadow: '0 6px 16px rgba(30, 92, 58, 0.3)' },
          }}
        >
          Contact Your Tailor
        </Button>
      </Box>
    </Box>
  );
};
