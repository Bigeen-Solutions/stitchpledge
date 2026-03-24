import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Grid,
  Stack,
  Button,
  Chip,
  alpha,
  useTheme,
  keyframes,
} from '@mui/material';
import {
  ContentCut as Scissors,
  LocalShipping as Truck,
  Add as Plus,
  ArrowForward as ArrowRight,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../features/dashboard/analytics.api';
import { keys } from '../../query/keys';

const countUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  delay: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, delay }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const start = 0;
    const end = value;
    const increment = end / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <Card
      sx={{
        flex: 1,
        p: 3,
        bgcolor: '#fafaf8',
        border: '1px solid #e5e4e0',
        borderRadius: '16px',
        textAlign: 'center',
        animation: `${countUp} 0.5s ease both ${delay}`,
      }}
    >
      <Box sx={{ color: '#1e5c3a', mb: 1.5, display: 'flex', justifyContent: 'center' }}>
        <Icon sx={{ fontSize: 24 }} />
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a2340', mb: 0.5 }}>
        {displayValue}
      </Typography>
      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, letterSpacing: 1 }}>
        {label}
      </Typography>
    </Card>
  );
};

export const TailorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: analytics } = useQuery({
    queryKey: keys.analytics.overview,
    queryFn: analyticsApi.getOverview,
  });

  const inProgressCount = analytics?.totalActiveOrders || 0;
  const overdueCount = analytics?.highRiskGarments || 0;
  const recentOrders = analytics?.recentOrders || [];
  
  const hasUrgent = overdueCount > 0;
  // Mock pending measurements since it's not in the analytics API yet
  const pendingMeasurements = 3;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', pb: 8 }}>
      <Typography variant="h4" sx={{ color: '#1a2340', fontWeight: 700, mb: 4, fontSize: '28px' }}>
        Dashboard Overview
      </Typography>

      <Stack spacing={3} sx={{ mb: 4 }}>
        {/* Urgent Action Card */}
        {hasUrgent && (
          <Card
            sx={{
              p: 0,
              bgcolor: '#fafaf8',
              border: '1px solid #e5e4e0',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            <Grid container>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Box
                  sx={{
                    height: { xs: 160, sm: '100%' },
                    bgcolor: alpha('#1e5c3a', 0.05),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '12px',
                      bgcolor: '#white',
                      border: '1px solid #e5e4e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Box component="img" src="https://images.unsplash.com/photo-1594932224458-db8ba8763b0b?q=80&w=200&auto=format&fit=crop" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 9 }}>
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Chip
                      label="CRITICAL"
                      sx={{
                        bgcolor: '#c0392b',
                        color: 'white',
                        height: 20,
                        fontSize: '10px',
                        fontWeight: 700,
                        borderRadius: '4px',
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                      {overdueCount} Deadlines Today
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ color: '#1a2340', fontWeight: 700, mb: 0.5 }}>
                    Urgent Action Required
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 2.5 }}>
                    {recentOrders.filter(o => o.riskLevel === 'OVERDUE').slice(0, 2).map(o => o.customerName).join(' & ')} need finishing.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/orders?filter=urgent')}
                    sx={{
                      bgcolor: '#1e5c3a',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                    }}
                  >
                    View Orders
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Card>
        )}

        {/* Pending Measurements Card */}
        {pendingMeasurements > 0 && (
          <Card
            sx={{
              p: 3,
              bgcolor: '#fafaf8',
              border: '1px solid #e5e4e0',
              borderLeft: '4px solid #c49a1a',
              borderRadius: '16px',
            }}
          >
            <Grid container alignItems="center" spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Chip
                  label="ACTION REQUIRED"
                  sx={{
                    bgcolor: '#c49a1a',
                    color: 'white',
                    height: 20,
                    fontSize: '10px',
                    fontWeight: 700,
                    borderRadius: '4px',
                    mb: 1.5,
                  }}
                />
                <Typography variant="h6" sx={{ color: '#1a2340', fontWeight: 700, mb: 0.5, fontSize: '16px' }}>
                  Pending Measurements
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                  {pendingMeasurements} clients are waiting for their initial fitting sessions.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/measurements?filter=pending')}
                  sx={{
                    borderColor: '#e5e4e0',
                    color: '#1a2340',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: '#1e5c3a', bgcolor: 'transparent' },
                  }}
                >
                  Open List
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '12px',
                    bgcolor: 'white',
                    border: '1px solid #e5e4e0',
                    overflow: 'hidden',
                  }}
                >
                  <Box component="img" src="https://images.unsplash.com/photo-1598501022223-42475940eb95?q=80&w=200&auto=format&fit=crop" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              </Grid>
            </Grid>
          </Card>
        )}
      </Stack>

      {/* Quick Stats Row */}
      <Grid container spacing={2}>
        <Grid size={6}>
          <StatCard label="IN PROGRESS" value={inProgressCount} icon={Scissors} delay="100ms" />
        </Grid>
        <Grid size={6}>
          <StatCard label="DUE THIS WEEK" value={overdueCount + 2} icon={Truck} delay="200ms" />
        </Grid>
      </Grid>

      {/* FAB */}
      <Button
        onClick={() => navigate('/orders/new')}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: '#1e5c3a',
          color: 'white',
          minWidth: 0,
          p: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '&:hover': { bgcolor: '#256b45' },
        }}
      >
        <Plus sx={{ fontSize: 28 }} />
      </Button>
    </Box>
  );
};
