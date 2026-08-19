import {
  Box,
  Typography,
  Card,
  Stack,
  Avatar,
  Chip,
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
import { QueryLoading, QueryEmpty } from '../../components/feedback/QueryState';
import { format } from 'date-fns';

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

  const activeOrders = ordersData?.items ?? [];

  const formatDeadline = (raw: string | undefined | null) => {
    if (!raw) return 'TBD';
    try { return format(new Date(raw), 'MMM d, yyyy'); } catch { return raw; }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pb: 8 }}>

      {/* Greeting */}
      <Card
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '20px',
          backgroundImage: 'none',
          background: 'linear-gradient(150deg, var(--sf-green) 0%, #163d28 100%)',
          color: 'white',
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Avatar
          src={user?.avatarUrl}
          sx={{ width: 72, height: 72, border: '3px solid rgba(255,255,255,0.15)' }}
        />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Hello, {user?.fullName?.split(' ')[0]}
          </Typography>
          <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
            {analytics?.totalActiveOrders
              ? `You have ${analytics.totalActiveOrders} order${analytics.totalActiveOrders !== 1 ? 's' : ''} in production.`
              : 'No active orders at the moment.'}
          </Typography>
        </Box>
      </Card>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 3 }}>
        Your orders
      </Typography>

      {isLoadingOrders ? (
        <QueryLoading label="Loading your orders…" />
      ) : activeOrders.length === 0 ? (
        <QueryEmpty
          message="No orders yet."
          hint="Your tailor will add orders to your account — they'll appear here."
        />
      ) : (
        <Stack spacing={3}>
          {activeOrders.map((order: any) => (
            <Card
              key={order.garmentId ?? order.id}
              elevation={0}
              sx={{
                p: 3,
                backgroundImage: 'none',
                bgcolor: 'var(--sf-parchment)',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: 'var(--sf-green)', transform: 'translateY(-1px)' },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, letterSpacing: 1.2 }}>
                    #{order.orderNumber ?? order.id?.split('-')[0].toUpperCase()}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {order.garmentName ?? 'Bespoke garment'}
                  </Typography>
                </Box>
                <Chip
                  icon={<Calendar sx={{ fontSize: 13 }} />}
                  label={`Due ${formatDeadline(order.deadline)}`}
                  size="small"
                  sx={{
                    bgcolor: alpha('#1e5c3a', 0.06),
                    color: 'var(--sf-green)',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    borderRadius: '8px',
                  }}
                />
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  endIcon={<ChevronRight sx={{ fontSize: 18 }} />}
                  sx={{ color: 'var(--sf-green)', fontWeight: 700, textTransform: 'none', fontSize: '13px' }}
                >
                  Order details
                </Button>
              </Box>
            </Card>
          ))}
        </Stack>
      )}

      {/* Contact section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Need to make a change or have a question?
        </Typography>
        <Button
          variant="contained"
          startIcon={<MessageSquare sx={{ fontSize: 20 }} />}
          sx={{
            bgcolor: 'var(--sf-green)',
            height: 48,
            px: 5,
            borderRadius: '999px',
            textTransform: 'none',
            fontSize: '15px',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(30,92,58,0.2)',
            '&:hover': { bgcolor: 'var(--sf-green-dark)' },
          }}
        >
          Contact your tailor
        </Button>
      </Box>
    </Box>
  );
};
