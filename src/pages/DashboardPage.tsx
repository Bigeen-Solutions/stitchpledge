import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../features/auth/auth.store';
import { analyticsApi } from '../features/dashboard/analytics.api';
import { keys } from '../query/keys';
import { WelcomePanel } from '../features/dashboard/components/WelcomePanel';
import { RiskBadge } from '../components/ui/RiskBadge';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Skeleton,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const theme = useTheme();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: keys.analytics.overview,
    queryFn: analyticsApi.getOverview,
  });

  if (isLoading) {
    return (
      <div className="dashboard-page container">
        <WelcomePanel />
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="dashboard-page container">
        <WelcomePanel />
        <Alert severity="error" sx={{ mt: 3 }}>Failed to load factory analytics. Please try again.</Alert>
      </div>
    );
  }

  const { totalActiveOrders, highRiskGarments, tasksByStage, recentOrders } = data;

  const totalTasksInProgress = Object.values(tasksByStage).reduce((acc, curr) => acc + curr, 0);
  const maxTasksInStage = Math.max(...Object.values(tasksByStage), 1); // Avoid division by zero

  const factoryHealth = highRiskGarments === 0 ? 'Excellent' : highRiskGarments <= 2 ? 'Warning' : 'Critical';
  const healthColor = factoryHealth === 'Excellent' ? theme.palette.success.main : factoryHealth === 'Warning' ? theme.palette.warning.main : theme.palette.error.main;

  return (
    <div className="dashboard-page container">
      <WelcomePanel />

      {/* Section A: KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', boxShadow: theme.shadows[2] }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Active Orders
              </Typography>
              <Typography variant="h3" component="div" color="primary.main" fontWeight="bold">
                {totalActiveOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', boxShadow: theme.shadows[2] }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                High-Risk Garments
              </Typography>
              <Typography variant="h3" component="div" color={highRiskGarments > 0 ? 'error.main' : 'text.primary'} fontWeight="bold">
                {highRiskGarments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', boxShadow: theme.shadows[2] }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Tasks In Progress
              </Typography>
              <Typography variant="h3" component="div" color="text.primary" fontWeight="bold">
                {totalTasksInProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', boxShadow: theme.shadows[2], borderBottom: `4px solid ${healthColor}` }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Factory Health
              </Typography>
              <Typography variant="h4" component="div" color={healthColor} fontWeight="bold" sx={{ mt: 1 }}>
                {factoryHealth}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Section B: The Bottleneck Board */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, height: '100%', boxShadow: theme.shadows[3], borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              The Bottleneck Board
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Current distribution of active tasks across production stages.
            </Typography>
            
            <List disablePadding>
              {Object.entries(tasksByStage)
                .sort(([, a], [, b]) => b - a)
                .map(([stageName, count]) => {
                  const percentage = (count / maxTasksInStage) * 100;
                  // Color gradient logic based on bottleneck severity vs others
                  const isBottleneck = count === maxTasksInStage && count > 0;
                  
                  return (
                    <ListItem key={stageName} disablePadding sx={{ mb: 2, display: 'block' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={isBottleneck ? "bold" : "medium"}>
                          {stageName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: isBottleneck ? theme.palette.warning.main : theme.palette.primary.main,
                          }
                        }} 
                      />
                    </ListItem>
                  );
                })}
              
              {Object.keys(tasksByStage).length === 0 && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No active tasks on the floor right now.
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Section C: Recent Orders Table */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3, height: '100%', boxShadow: theme.shadows[3], borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Orders / High Risk
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The most recently created or updated orders and their risk assessment.
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Order</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Garment</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Risk</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((row) => (
                    <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${row.id}`)}>
                      <TableCell>{row.id.split('-')[0].toUpperCase()}</TableCell>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>{row.garmentName}</TableCell>
                      <TableCell>
                        <RiskBadge level={row.riskLevel as any} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};
