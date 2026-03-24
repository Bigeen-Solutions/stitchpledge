import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Stack,
  alpha,
  useTheme,
  keyframes,
} from '@mui/material';
import {
  ContentCut as Scissors,
  AddCircle as PlusCircle,
  PersonAdd as UserPlus,
  Schedule as CalendarClock,
  Inventory as Package,
  Add as Plus,
} from '@mui/icons-material';
import { Fab } from '@mui/material';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface QuickStartTipProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  bgTint: string;
  delay: string;
  onClick: () => void;
}

const QuickStartTip: React.FC<QuickStartTipProps> = ({ title, subtitle, icon: Icon, bgTint, delay, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 3,
        bgcolor: '#fafaf8',
        border: '1px solid #e5e4e0',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        animation: `${fadeInUp} 0.5s ease both ${delay}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#1e5c3a',
          boxShadow: '0 8px 16px rgba(0,0,0,0.04)',
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '10px',
          bgcolor: bgTint,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          color: '#1e5c3a',
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a2340', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#6b7280' }}>
        {subtitle}
      </Typography>
    </Card>
  );
};

export const TailorDashboardEmpty: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: 'auto',
        pt: { xs: 4, md: 8 },
        pb: 8,
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Empty State Illustration Area */}
      <Card
        sx={{
          maxWidth: 680,
          width: '100%',
          p: { xs: 4, md: 6 },
          bgcolor: '#fafaf8',
          border: '2px dashed #e5e4e0',
          borderRadius: '24px',
          textAlign: 'center',
          mb: 6,
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            bgcolor: alpha('#1e5c3a', 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 4,
            animation: `${pulse} 2s infinite ease-in-out`,
          }}
        >
          <Scissors sx={{ fontSize: 48, color: '#1e5c3a' }} />
        </Box>

        <Typography variant="h4" sx={{ color: '#1a2340', fontWeight: 700, mb: 1.5, fontSize: '24px' }}>
          Your shop is ready to sew.
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 4, maxWidth: 440, mx: 'auto', lineHeight: 1.6 }}>
          You haven't added any orders yet. Start tracking your first garment to see your dashboard come to life.
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate('/orders/new')}
          startIcon={<PlusCircle sx={{ fontSize: 24 }} />}
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
          Create Your First Order
        </Button>
      </Card>

      {/* Quick Start Tips */}
      <Box sx={{ width: '100%', maxWidth: 820 }}>
        <Typography variant="h6" sx={{ color: '#1a2340', fontWeight: 700, mb: 3 }}>
          Quick Start Tips
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <QuickStartTip
              title="Add a Client"
              subtitle="Build your digital measurement book."
              icon={UserPlus}
              bgTint={alpha('#1e5c3a', 0.06)}
              delay="100ms"
              onClick={() => navigate('/clients/new')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <QuickStartTip
              title="Set a Deadline"
              subtitle="Never miss a fitting session again."
              icon={CalendarClock}
              bgTint={alpha('#c49a1a', 0.08)}
              delay="200ms"
              onClick={() => navigate('/orders')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <QuickStartTip
              title="Manage Inventory"
              subtitle="Track fabrics and supplies."
              icon={Package}
              bgTint={alpha('#1e5c3a', 0.06)}
              delay="300ms"
              onClick={() => navigate('/inventory')}
            />
          </Grid>
        </Grid>
      </Box>

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
