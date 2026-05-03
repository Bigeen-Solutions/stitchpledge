import React from 'react';
import { Box, Card, Typography, CircularProgress, Stack, LinearProgress, alpha, Grid } from '@mui/material';
import { WorkspacePremium as WorkspacePremiumIcon } from '@mui/icons-material';
import { useStitchScore } from '../useStitchScore';

export const StitchScoreCard: React.FC = () => {
  const { data, isLoading, isError } = useStitchScore();

  if (isLoading) {
    return (
      <Card sx={{ p: 4, borderRadius: '20px', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#1e5c3a' }} />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card sx={{ p: 4, borderRadius: '20px', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">Unable to load StitchScore</Typography>
      </Card>
    );
  }

  const { score, status, thresholdProgress, isFoundingMember, breakdown } = data;

  if (status === 'INSUFFICIENT_DATA' || status === 'QUALIFYING') {
    return (
      <Card sx={{ 
        p: { xs: 3, md: 4 }, 
        borderRadius: '20px', 
        border: '1px solid rgba(255, 255, 255, 0.3)',
        bgcolor: 'rgba(255, 255, 255, 0.4)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        backdropFilter: 'blur(10px)',
      }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a2340', mb: 1 }}>
              StitchScore
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', maxWidth: '500px' }}>
              Building your Reputation Capital. Your StitchScore will be unlocked once you establish a consistent track record of completed orders.
            </Typography>
          </Box>

          <Box sx={{ bgcolor: alpha('#1e5c3a', 0.05), p: 3, borderRadius: '16px' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e5c3a' }}>
                Qualifying Phase
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e5c3a' }}>
                {thresholdProgress} / 10 Orders
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={(thresholdProgress / 10) * 100} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                bgcolor: alpha('#1e5c3a', 0.1),
                '& .MuiLinearProgress-bar': { bgcolor: '#1e5c3a', borderRadius: 5 }
              }} 
            />
          </Box>
        </Stack>
      </Card>
    );
  }

  // ACTIVE State
  return (
    <Card sx={{ 
      p: { xs: 3, md: 4 }, 
      borderRadius: '20px', 
      border: '1px solid rgba(255, 255, 255, 0.3)',
      bgcolor: 'rgba(255, 255, 255, 0.4)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {isFoundingMember && (
        <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 0.5, color: '#d97706' }}>
          <WorkspacePremiumIcon fontSize="small" />
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Founding Member</Typography>
        </Box>
      )}

      <Grid container spacing={4} alignItems="center">
        {/* Score Ring */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={140}
              thickness={4}
              sx={{ color: alpha('#1e5c3a', 0.1) }}
            />
            <CircularProgress
              variant="determinate"
              value={score || 0}
              size={140}
              thickness={4}
              sx={{ 
                color: score && score >= 80 ? '#1e5c3a' : score && score >= 60 ? '#d97706' : '#dc2626',
                position: 'absolute', 
                left: 0 
              }}
            />
            <Box
              sx={{
                top: 0, left: 0, bottom: 0, right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h3" component="div" sx={{ fontWeight: 900, color: '#1a2340', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {score}
              </Typography>
            </Box>
          </Box>
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 800, color: '#1a2340' }}>
            StitchScore
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Reputation Index
          </Typography>
        </Grid>

        {/* Breakdowns */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <MetricBar label="On-Time Delivery Rate" value={(breakdown.onTimeRate || 0) * 100} color="#1e5c3a" />
            <MetricBar label="Zero-Dispute Integrity" value={(breakdown.integrityRate || 0) * 100} color="#0369a1" />
            <MetricBar label="Client Loyalty Rate" value={(breakdown.loyaltyRate || 0) * 100} color="#6d28d9" />
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};

// Helper sub-component
const MetricBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a2340' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 800, color }}>{Math.round(value)}%</Typography>
    </Stack>
    <LinearProgress 
      variant="determinate" 
      value={value} 
      sx={{ 
        height: 8, 
        borderRadius: 4,
        bgcolor: alpha(color, 0.1),
        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 }
      }} 
    />
  </Box>
);
