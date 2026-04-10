import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../infrastructure/http/axios.client';

const AuditLogPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ['audit-log'],
    queryFn: async () => {
      const { data } = await apiClient.get<any[]>('/audit');
      return data;
    },
  });

  const getEventChip = (type: string) => {
    switch (type) {
      case 'ORDER_CREATED':
        return <Chip label="ORDER CREATED" size="small" sx={{ bgcolor: '#e3f2fd', color: '#0d47a1', fontWeight: 700, borderRadius: '4px' }} />;
      case 'STAGE_COMPLETED':
        return <Chip label="STAGE COMPLETED" size="small" sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 700, borderRadius: '4px' }} />;
      case 'MATERIAL_RECEIVED':
        return <Chip label="MATERIAL RECEIVED" size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700, borderRadius: '4px' }} />;
      default:
        return <Chip label={type} size="small" sx={{ borderRadius: '4px' }} />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
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

      <TableContainer 
        component={Paper} 
        className="sf-glass"
        sx={{ 
          borderRadius: '16px', 
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
          overflow: 'hidden',
          bgcolor: 'rgba(255, 255, 255, 0.4)'
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(249, 250, 251, 0.8)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#6b7280', fontSize: '11px', letterSpacing: '0.05em' }}>TIMESTAMP</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#6b7280', fontSize: '11px', letterSpacing: '0.05em' }}>EVENT TYPE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#6b7280', fontSize: '11px', letterSpacing: '0.05em' }}>DETAIL</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#6b7280', fontSize: '11px', letterSpacing: '0.05em' }}>REFERENCE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 12 }}>
                  <CircularProgress size={28} thickness={5} sx={{ color: '#1e5c3a' }} />
                </TableCell>
              </TableRow>
            ) : !events || events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 12 }}>
                  <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>No events recorded in the current telemetry window.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              events.map((event, index) => (
                <TableRow 
                  key={event.id || index} 
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell sx={{ color: '#6b7280', fontSize: '13px', fontWeight: 500 }}>
                    {event.createdAt ? new Date(event.createdAt).toLocaleString() : 'Unknown Date'}
                  </TableCell>
                  <TableCell>
                    {getEventChip(event.event_type)}
                  </TableCell>
                  <TableCell sx={{ color: '#1a2340', fontWeight: 600, fontSize: '14px' }}>
                    {event.detail}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: '#6b7280', fontSize: '13px' }}>
                    {event.id?.split('-')[0].toUpperCase() || 'SYS'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuditLogPage;
