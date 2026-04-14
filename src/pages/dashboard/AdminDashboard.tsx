import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  alpha,
  keyframes,
  Skeleton,
  Alert,
  AlertTitle,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Assignment as ClipboardList,
  Warning as AlertTriangle,
  Speed as Gauge,
  Add as Plus,
  PersonAdd as UserPlus,
  ManageAccounts as UserCog,
  Check,
  ContentCut as Scissors,
  History,
  Search,
  NotificationsNone as NotificationsNoneIcon,
} from '@mui/icons-material';
import { safeFormatDistanceToNow } from '../../utils/format';
import type {
  ActivityItem,
  MaterialStock
} from '../../features/dashboard/analytics.api';
import { useAdminAnalytics } from '../../features/dashboard/useAdminAnalytics';
import { useOrders } from '../../features/orders/hooks/useOrders';
import { useInventory } from '../../features/inventory/useInventory';
import { OrderEntryItem } from '../../features/orders/components/OrderEntryItem';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const glassPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(30, 92, 58, 0.2); }
  70% { box-shadow: 0 0 0 10px rgba(30, 92, 58, 0); }
  100% { box-shadow: 0 0 0 0 rgba(30, 92, 58, 0); }
`;

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend: { value: string; type: 'positive' | 'negative' | 'neutral' };
  delay: string;
  variant?: 'emerald' | 'ruby' | 'amber' | 'azure';
}

const KPICard: React.FC<KPICardProps> = ({ label, value, icon: Icon, trend, delay, variant = 'emerald' }) => {
  const getColors = () => {
    switch (variant) {
      case 'ruby': return { main: '#EF4444', bg: 'rgba(239, 68, 68, 0.05)', grad: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(255, 255, 255, 0.4) 100%)' };
      case 'amber': return { main: '#C49A1A', bg: 'rgba(196, 154, 26, 0.05)', grad: 'linear-gradient(135deg, rgba(196, 154, 26, 0.08) 0%, rgba(255, 255, 255, 0.4) 100%)' };
      case 'azure': return { main: '#3B82F6', bg: 'rgba(59, 130, 246, 0.05)', grad: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.4) 100%)' };
      default: return { main: '#1e5c3a', bg: 'rgba(30, 92, 58, 0.05)', grad: 'linear-gradient(135deg, rgba(30, 92, 58, 0.08) 0%, rgba(255, 255, 255, 0.4) 100%)' };
    }
  };

  const colors = getColors();
  const trendColor = trend.type === 'positive' ? '#1e5c3a' : trend.type === 'negative' ? '#c0392b' : '#c49a1a';

  return (
    <Card
      sx={{
        p: 3,
        background: colors.grad,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '24px',
        height: '100%',
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.03)',
        animation: `${fadeIn} 0.6s ease-out both ${delay}`,
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 12px 30px 0 rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: '12px',
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            color: colors.main
          }}
        >
          <Icon sx={{ fontSize: 20 }} />
        </Box>
        <Chip
          label={trend.value}
          size="small"
          sx={{
            height: 22,
            fontSize: '10px',
            fontWeight: 800,
            bgcolor: alpha(trendColor, 0.1),
            color: trendColor,
            borderRadius: '6px',
            letterSpacing: '0.05em'
          }}
        />
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a2340', mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '10px' }}>
          {label}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={70} // This could be more dynamic if needed
        sx={{
          mt: 2,
          height: 6,
          borderRadius: 3,
          bgcolor: 'rgba(0,0,0,0.03)',
          '& .MuiLinearProgress-bar': {
            bgcolor: colors.main,
            borderRadius: 3
          },
        }}
      />
    </Card>
  );
};

const getActivityIcon = (iconType?: string) => {
  switch (iconType) {
    case 'STAGE':
      return Scissors;
    case 'MATERIAL':
      return ClipboardList;
    case 'ORDER':
      return Plus;
    case 'CHECK':
      return Check;
    default:
      return History;
  }
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: analytics, isLoading, isError } = useAdminAnalytics();
  const { data: ordersData } = useOrders(1, 5);
  const { data: rawInventory, dataUpdatedAt: inventoryUpdatedAt } = useInventory();

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: '12px' }}>
          <AlertTitle sx={{ fontWeight: 700 }}>Telemetry Sync Failure</AlertTitle>
          The Admin Analytics engine is currently unreachable. Please verify network connectivity and risk engine status.
        </Alert>
      </Box>
    );
  }

  const stats = {
    activeOrders: analytics?.totalActiveOrders ?? 0,
    highRisk: analytics?.highRiskGarments ?? 0,
    completedOrders: analytics?.completedOrders ?? 0,
    avgTime: analytics?.avgCompletionTimeHours ? `${analytics.avgCompletionTimeHours}h` : '--',
  };

  const activity: ActivityItem[] = analytics?.activityFeed || [];

  // Connect real inventory data with NaN defense
  const stocks: MaterialStock[] = (rawInventory || []).map(item => {
    const percentage = item.totalLedger > 0
      ? Math.round((item.quantityAvailable / item.totalLedger) * 100)
      : 0;

    // Defensive color mapping for the premium UI
    let color = '#4caf50'; // Green
    if (percentage <= 30) color = '#f44336'; // Red
    else if (percentage <= 70) color = '#ff9800'; // Orange

    return {
      name: item.name,
      level: percentage,
      color
    };
  });

  const tasksByStage = analytics?.tasksByStage || {};
  const stages = Object.keys(tasksByStage).map(name => ({
    name,
    count: tasksByStage[name],
    completed: Math.floor(tasksByStage[name] * 0.3),
    inProgress: Math.ceil(tasksByStage[name] * 0.7)
  }));
  const recentOrders = ordersData?.items || [];

  return (
    <Box sx={{ pb: 8, position: 'relative' }}>
      {/* Modern App-like Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 6,
          gap: 3,
          p: 3,
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
          animation: `${fadeIn} 0.6s ease-out`,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a2340', letterSpacing: '-0.02em' }}>
            Production Intelligence
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            Factory Command Center •
            <Box component="span" sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              color: '#1e5c3a',
              fontWeight: 800,
              fontSize: '11px',
              letterSpacing: '0.05em'
            }}>
              <Box sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'currentColor',
                animation: `${glassPulse} 2s infinite`
              }} />
              LIVE
            </Box>
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
          <TextField
            placeholder="Search orders, clients, or tasks..."
            variant="outlined"
            size="small"
            sx={{
              width: { xs: '100%', md: 320 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                bgcolor: 'rgba(255, 255, 255, 0.6)',
                '& fieldset': { borderColor: 'rgba(0,0,0,0.05)' },
                '&:hover fieldset': { borderColor: '#1e5c3a' },
                transition: 'all 0.2s',
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Avatar sx={{ bgcolor: 'white', color: '#1a2340', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', '&:hover': { bgcolor: '#f3f4f6' } }}>
            <NotificationsNoneIcon sx={{ fontSize: 20 }} />
          </Avatar>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '24px' }} />
          ) : (
            <KPICard
              label="ACTIVE ORDERS"
              value={stats.activeOrders}
              icon={ClipboardList}
              trend={{ value: 'Real-time', type: 'neutral' }}
              delay="0ms"
              variant="emerald"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '24px' }} />
          ) : (
            <KPICard
              label="HIGH-RISK"
              value={stats.highRisk}
              icon={AlertTriangle}
              trend={{ value: stats.highRisk ? 'Urgent' : 'Safe', type: stats.highRisk ? 'negative' : 'positive' }}
              delay="100ms"
              variant="ruby"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '24px' }} />
          ) : (
            <KPICard
              label="COMPLETED"
              value={stats.completedOrders}
              icon={Check}
              trend={{ value: 'Daily', type: 'neutral' }}
              delay="200ms"
              variant="amber"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '24px' }} />
          ) : (
            <KPICard
              label="AVG TIME"
              value={stats.avgTime}
              icon={Gauge}
              trend={{ value: 'Optimal', type: 'positive' }}
              delay="300ms"
              variant="azure"
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={4}>
            {/* Bottleneck Board */}
            <Card
              sx={{
                p: 4,
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                animation: `${fadeIn} 0.6s ease-out both 400ms`,
                boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.02)',
              }}
            >
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a2340' }}>
                    Bottleneck Board
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                    Live workload distribution across factory sectors
                  </Typography>
                </Box>
                <Stack direction="row" spacing={3}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: '#1e5c3a' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a2340', fontSize: '10px' }}>DONE</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: '#c49a1a' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a2340', fontSize: '10px' }}>WIP</Typography>
                  </Stack>
                </Stack>
              </Box>

              <Stack spacing={3}>
                {stages.map((stage) => {
                  const total = stage.completed + stage.inProgress + 4; // Mock total
                  return (
                    <Box key={stage.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#6b7280', letterSpacing: '0.05em' }}>
                          {stage.name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#1a2340' }}>
                          {stage.count}
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 10, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 5, display: 'flex', overflow: 'hidden' }}>
                        <Box sx={{ width: `${(stage.completed / total) * 100}%`, bgcolor: '#1e5c3a', transition: 'width 1s ease-out' }} />
                        <Box sx={{ width: `${(stage.inProgress / total) * 100}%`, bgcolor: '#c49a1a', transition: 'width 1s ease-out 0.2s' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Card>

            {/* Recent Orders List */}
            <Box
              sx={{
                p: 3,
                animation: `${fadeIn} 0.6s ease-out both 500ms`,
                borderRadius: '24px',
                border: '1px solid rgba(0,0,0,0.03)',
                bgcolor: 'rgba(255,255,255,0.3)',
              }}
            >
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a2340' }}>
                  Live Orders
                </Typography>
                <Button
                  onClick={() => navigate('/orders')}
                  endIcon={<Plus sx={{ fontSize: 16 }} />}
                  sx={{ color: '#1e5c3a', fontWeight: 700, fontSize: '12px', textTransform: 'none' }}
                >
                  View All
                </Button>
              </Box>

              <Stack spacing={0}>
                {recentOrders.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary', p: 4, textAlign: 'center' }}>
                    No active orders found in the production projection.
                  </Typography>
                ) : (
                  recentOrders.map((order: any) => (
                    <OrderEntryItem
                      key={order.id}
                      order={order}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    />
                  ))
                )}
              </Stack>
            </Box>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={4}>
            {/* Team Activity Feed */}
            <Card
              sx={{
                p: 3,
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                animation: `${fadeIn} 0.6s ease-out both 600ms`,
                boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.02)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a2340', mb: 3 }}>
                Team Stream
              </Typography>
              <List disablePadding>
                {activity.map((item, index) => {
                  const ActivityIcon = getActivityIcon(item.iconType);
                  return (
                    <ListItem key={index} disablePadding sx={{ mb: 3, position: 'relative' }}>
                      <ListItemAvatar sx={{ minWidth: 54 }}>
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: 'white',
                            color: item.color || '#1e5c3a',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            border: `1px solid ${alpha(item.color || '#1e5c3a', 0.1)}`
                          }}
                        >
                          <ActivityIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#1a2340', lineHeight: 1.4 }}>
                            {item.text} <Box component="span" sx={{ fontWeight: 500, color: '#6b7280' }}>{item.detail}</Box>
                          </Typography>
                        }
                        secondary={item.time ? safeFormatDistanceToNow(item.time) : 'Just now'}
                        secondaryTypographyProps={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, mt: 0.5, letterSpacing: '0.02em' }}
                      />
                    </ListItem>
                  );
                })}
              </List>
              <Button
                variant="text"
                fullWidth
                onClick={() => navigate('/reports/audit')}
                sx={{
                  mt: 1,
                  color: '#6b7280',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', color: '#1e5c3a' },
                }}
              >
                VIEW FULL AUDIT LOG
              </Button>
            </Card>

            {/* Material Stock Card */}
            <Card
              sx={{
                p: 3,
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #064e3b 0%, #163d28 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                animation: `${fadeIn} 0.6s ease-out both 700ms`,
                boxShadow: '0 20px 40px -10px rgba(6, 78, 59, 0.3)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: alpha('#ffffff', 0.6), letterSpacing: '0.15em', mb: 3, display: 'block' }}>
                MATERIAL RESOURCE
              </Typography>
              <Stack spacing={2.5} sx={{ mb: 4 }}>
                {stocks.map((stock) => (
                  <Box key={stock.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '13px' }}>{stock.name}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'white', fontSize: '13px' }}>{stock.level}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stock.level}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: stock.color,
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
               <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.4), fontSize: '10px' }}>
                {inventoryUpdatedAt ? `Live Inventory (Synced ${new Date(inventoryUpdatedAt).toLocaleTimeString()})` : 'Syncing...'}
              </Typography>
              <Box sx={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.05, transform: 'rotate(-15deg)' }}>
                <Scissors sx={{ fontSize: 80 }} />
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* FAB with SpeedDial */}
      <SpeedDial
        ariaLabel="Admin Actions"
        sx={{
          position: 'fixed',
          bottom: { xs: 88, md: 24 },
          right: 24,
          zIndex: 1200 // Higher than BottomNav (1100)
        }}
        icon={<SpeedDialIcon icon={<Plus />} />}
        FabProps={{
          sx: {
            bgcolor: '#1e5c3a',
            '&:hover': { bgcolor: '#256b45' },
          },
        }}
      >
        <SpeedDialAction
          icon={<ClipboardList sx={{ fontSize: 20 }} />}
          tooltipTitle="New Order"
          onClick={() => navigate('/orders/new')}
        />
        <SpeedDialAction
          icon={<UserPlus sx={{ fontSize: 20 }} />}
          tooltipTitle="See Customers"
          onClick={() => navigate('/customers')}
        />
        <SpeedDialAction
          icon={<UserCog sx={{ fontSize: 20 }} />}
          tooltipTitle="Add Staff"
          onClick={() => navigate('/staff/new')}
        />
      </SpeedDial>
    </Box>
  );
};
