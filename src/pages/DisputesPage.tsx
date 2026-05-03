import React from 'react';
import { Box, Typography, Stack, Paper, Alert, AlertTitle } from '@mui/material';
import { Gavel as GavelIcon } from '@mui/icons-material';

export const DisputesPage: React.FC = () => {
  return (
    <Box className="container" sx={{ py: 4 }}>
      <header style={{ marginBottom: 40 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <GavelIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography 
            variant="h4" 
            className="mobile-page-title" 
            sx={{ 
              fontSize: { xs: '1.25rem', md: '2.125rem' }, 
              fontWeight: 800 
            }}
          >
            Dispute Resolution Portal
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
          Structured Arbitration Lifecycle. Manage production standoffs and generate cryptographic resolution tokens.
        </Typography>
      </header>

      <Alert severity="warning" sx={{ mb: 4, borderRadius: '12px' }}>
        <AlertTitle sx={{ fontWeight: 700 }}>Arbitration State Machine Active</AlertTitle>
        Active disputes currently suspend production workflows via Trust Gates. Unlocking orders requires a verified Resolution Token.
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
          No active disputes found. The workshop is operating under full Trust parameters.
        </Typography>
      </Paper>
    </Box>
  );
};
