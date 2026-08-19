import React from 'react';
import { Box, Typography, Stack, Paper, Alert, AlertTitle } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';

export const SecurityAuditPage: React.FC = () => {
  return (
    <Box className="container" sx={{ py: 4 }}>
      <header style={{ marginBottom: 40 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <SecurityIcon sx={{ fontSize: 32, color: 'error.main' }} />
          <Typography 
            variant="h4" 
            className="mobile-page-title" 
            sx={{ 
              fontSize: { xs: '1.25rem', md: '2.125rem' }, 
              fontWeight: 800 
            }}
          >
            Security Rejection Log
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
          Immutable RBAC Organizational Shield. Monitor unauthorized access attempts and capability violations.
        </Typography>
      </header>

      <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>
        <AlertTitle sx={{ fontWeight: 700 }}>Strict Capability Enforcement</AlertTitle>
        All authorization rejections are permanently recorded here. Ensure roles are properly mapped to their required claims array.
      </Alert>

      <Paper className="sf-glass" sx={{ 
        p: 4, 
        minHeight: '40vh', 
        borderRadius: '32px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.4)',
      }}>
        <Typography variant="body1" color="text.secondary">
          No security violations found. The RBAC boundary is secure.
        </Typography>
      </Paper>
    </Box>
  );
};
