import React from 'react';
import {
  Box,
  Typography,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Breadcrumbs,
  Link,
  CircularProgress,
  Stack,
  alpha
} from '@mui/material';
import {
  AddShoppingCart as AddShoppingCartIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  LocalShipping as LocalShippingIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../infrastructure/http/axios.client';
import { MobileHeader } from '../components/layout/MobileHeader';

const AuditLogPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ['audit-log'],
    queryFn: async () => {
      const { data } = await apiClient.get<any[]>('/audit');
      return data;
    },
  });

  const getEventAvatarProps = (type: string) => {
    switch (type) {
      case 'ORDER_CREATED':
        return { icon: <AddShoppingCartIcon fontSize="small" />, bgcolor: alpha('#0d47a1', 0.1), color: '#0d47a1', label: 'ORDER CREATED' };
      case 'STAGE_COMPLETED':
        return { icon: <CheckCircleOutlineIcon fontSize="small" />, bgcolor: alpha('#1b5e20', 0.1), color: '#1b5e20', label: 'STAGE COMPLETED' };
      case 'MATERIAL_RECEIVED':
        return { icon: <LocalShippingIcon fontSize="small" />, bgcolor: alpha('#e65100', 0.1), color: '#e65100', label: 'MATERIAL RECEIVED' };
      default:
        return { icon: <InfoOutlinedIcon fontSize="small" />, bgcolor: alpha('#000', 0.05), color: 'text.secondary', label: type || 'SYSTEM EVENT' };
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', paddingBottom: '90px' }}>
      <MobileHeader 
        title="System Audit Log" 
        subtitle="Chronological record of transactions"
      />

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            component="button" 
            onClick={() => navigate('/dashboard')} 
            sx={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px', '&:hover': { color: '#1e5c3a' } }}
          >
            Dashboard
          </Link>
          <Link 
            component="button" 
            onClick={() => navigate('/reports')} 
            sx={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px', '&:hover': { color: '#1e5c3a' } }}
          >
            Reports
          </Link>
          <Typography color="text.primary" sx={{ fontSize: '14px', fontWeight: 500 }}>Audit Log</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a2340', mb: 1, letterSpacing: '-0.02em' }}>
            System Audit Log
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280', maxWidth: '600px' }}>
            Chronological record of all critical system transactions and lifecycle events across the factory floor and inventory vault.
          </Typography>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      ) : !events || events.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
          <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: alpha('#000', 0.05), color: 'text.disabled', width: 64, height: 64 }}>
            <InfoOutlinedIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No events recorded in the current telemetry window.
          </Typography>
        </Box>
      ) : (
        <Card sx={{ borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider' }}>
          <List sx={{ p: 0 }}>
            {events.map((event, index) => {
              const eventProps = getEventAvatarProps(event.event_type);
              return (
                <Box key={`${event.id || 'evt'}-${index}`}>
                  <ListItem 
                    sx={{ 
                      p: { xs: 2.5, sm: 3 },
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { xs: 'flex-start', md: 'center' },
                      gap: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 'auto', mt: 0.5 }}>
                        <Avatar sx={{ bgcolor: eventProps.bgcolor, color: eventProps.color, width: 40, height: 40 }}>
                          {eventProps.icon}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        disableTypography
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a2340', mb: 0.5, lineHeight: 1.3 }}>
                            {event.detail}
                          </Typography>
                        }
                        secondary={
                          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
                            <Chip 
                              label={eventProps.label} 
                              size="small" 
                              sx={{ bgcolor: eventProps.bgcolor, color: eventProps.color, fontWeight: 800, borderRadius: '6px', fontSize: '10px' }} 
                            />
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, fontFamily: 'monospace' }}>
                              REF: {event.id?.split('-')[0].toUpperCase() || 'SYS'}
                            </Typography>
                          </Stack>
                        }
                      />
                    </Box>
                    <Box sx={{ mt: { xs: 1, md: 0 }, ml: { xs: 7, md: 0 }, textAlign: { xs: 'left', md: 'right' } }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {event.createdAt ? new Date(event.createdAt).toLocaleString() : 'Unknown Date'}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < events.length - 1 && <Box sx={{ height: '1px', bgcolor: 'divider', ml: { xs: 9, md: 3 }, mr: { md: 3 } }} />}
                </Box>
              )
            })}
          </List>
        </Card>
      )}
    </Box>
  );
};

export default AuditLogPage;
