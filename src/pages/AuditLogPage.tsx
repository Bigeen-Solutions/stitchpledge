import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MobileHeader } from '../components/layout/MobileHeader';
import { AuditTrailTimeline } from '../features/audit/components/AuditTrailTimeline';

const AuditLogPage: React.FC = () => {
  const navigate = useNavigate();

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

      <Box sx={{ 
        bgcolor: 'background.paper', 
        p: 3, 
        borderRadius: '24px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.04)', 
        border: '1px solid', 
        borderColor: 'divider' 
      }}>
        <AuditTrailTimeline />
      </Box>
    </Box>
  );
};

export default AuditLogPage;
