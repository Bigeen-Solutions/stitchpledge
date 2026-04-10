import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  Chip,
  LinearProgress,
  Link,
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

const countUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend: { value: string; type: 'positive' | 'negative' | 'neutral' };
  delay: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, icon: Icon, trend, delay }) => {
  const trendColor = trend.type === 'positive' ? '#1e5c3a' : trend.type === 'negative' ? '#c0392b' : '#c49a1a';
  const progressValue = trend.type === 'positive' ? 75 : trend.type === 'negative' ? 40 : 60;

  return (
    <Card
      sx={{
        p: 3,
        bgcolor: '#fafaf8',
        border: '1px solid #e5e4e0',
        borderRadius: '16px',
        height: '100%',
        animation: `${countUp} 0.5s ease both ${delay}`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>
          {label}
        </Typography>
        <Box sx={{ color: '#6b7280' }}>
          <Icon sx={{ fontSize: 20 }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2340' }}>
          {value}
        </Typography>
        <Chip
          label={trend.value}
          size="small"
          sx={{
            height: 20,
            fontSize: '10px',
            fontWeight: 700,
            bgcolor: alpha(trendColor, 0.1),
            color: trendColor,
            borderRadius: '4px',
          }}
        />
      </Box>
      <LinearProgress
        variant="determinate"
        value={progressValue}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: alpha(trendColor, 0.1),
          '& .MuiLinearProgress-bar': { bgcolor: trendColor },
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
    <Box sx={{ pb: 8 }}>
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '16px' }} />
          ) : (
            <KPICard
              label="ACTIVE ORDERS"
              value={stats.activeOrders}
              icon={ClipboardList}
              trend={{ value: 'Real-time', type: 'neutral' }}
              delay="0ms"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '16px' }} />
          ) : (
            <KPICard
              label="HIGH-RISK GARMENTS"
              value={stats.highRisk}
              icon={AlertTriangle}
              trend={{ value: stats.highRisk ? 'Critical' : 'Safe', type: stats.highRisk ? 'negative' : 'positive' }}
              delay="100ms"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '16px' }} />
          ) : (
            <KPICard
              label="COMPLETED ORDERS"
              value={stats.completedOrders}
              icon={Check}
              trend={{ value: 'Total', type: 'neutral' }}
              delay="200ms"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '16px' }} />
          ) : (
            <KPICard
              label="AVG COMPLETION"
              value={stats.avgTime}
              icon={Gauge}
              trend={{ value: 'Optimal', type: 'positive' }}
              delay="300ms"
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={4}>
            {/* Bottleneck Board */}
            <Card sx={{ p: 4, borderRadius: '16px', border: '1px solid #e5e4e0', bgcolor: '#fafaf8' }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2340' }}>
                  Bottleneck Board
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Live workload distribution across factory sectors
                </Typography>
                <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1e5c3a' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a2340' }}>Completed</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#c49a1a' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a2340' }}>In Progress</Typography>
                  </Stack>
                </Stack>
              </Box>

              <Stack spacing={3}>
                {stages.map((stage) => {
                  const total = stage.completed + stage.inProgress + 4; // Mock total
                  return (
                    <Box key={stage.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', letterSpacing: 1 }}>
                          {stage.name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a2340' }}>
                          {stage.count} Tasks
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 12, bgcolor: '#e5e4e0', borderRadius: 6, display: 'flex', overflow: 'hidden' }}>
                        <Box sx={{ width: `${(stage.completed / total) * 100}%`, bgcolor: '#1e5c3a' }} />
                        <Box sx={{ width: `${(stage.inProgress / total) * 100}%`, bgcolor: '#c49a1a' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Card>

            {/* Recent Orders List */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2340' }}>
                  Recent Orders / High Risk
                </Typography>
                <Link
                  component="button"
                  onClick={() => navigate('/orders')}
                  sx={{ color: '#1e5c3a', fontWeight: 600, fontSize: '14px', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  View All Orders
                </Link>
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
            <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid #e5e4e0', bgcolor: '#fafaf8' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2340', mb: 2 }}>
                Team Activity
              </Typography>
              <List disablePadding>
                {activity.map((item, index) => {
                  const ActivityIcon = getActivityIcon(item.iconType);
                  return (
                    <ListItem key={index} disablePadding sx={{ mb: 2.5 }}>
                      <ListItemAvatar sx={{ minWidth: 48 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(item.color || '#1e5c3a', 0.1), color: item.color }}>
                          <ActivityIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a2340' }}>
                            {item.text} <Box component="span" sx={{ fontWeight: 400, color: '#6b7280' }}>{item.detail}</Box>
                          </Typography>
                        }
                        secondary={item.time ? safeFormatDistanceToNow(item.time) : 'Just now'}
                        secondaryTypographyProps={{ fontSize: '11px', color: '#9CA3AF', mt: 0.5 }}
                      />
                    </ListItem>
                  );
                })}
              </List>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/reports/audit')}
                sx={{
                  mt: 2,
                  borderColor: '#e5e4e0',
                  color: '#6b7280',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  '&:hover': { borderColor: '#1e5c3a', bgcolor: 'transparent', color: '#1e5c3a' },
                }}
              >
                VIEW FULL AUDIT LOG
              </Button>
            </Card>

            {/* Material Stock Card */}
            <Card
              sx={{
                p: 3,
                borderRadius: '20px',
                bgcolor: '#163d28',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: alpha('#ffffff', 0.6), letterSpacing: 1.5, mb: 3, display: 'block' }}>
                MATERIAL STOCK
              </Typography>
              <Stack spacing={2.5} sx={{ mb: 4 }}>
                {stocks.map((stock) => (
                  <Box key={stock.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{stock.name}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: stock.color }}>{stock.level}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stock.level}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: alpha('#ffffff', 0.1),
                        '& .MuiLinearProgress-bar': { bgcolor: stock.color },
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
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
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
