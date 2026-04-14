import React from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title, 
  subtitle, 
  onBack,
  action 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <Box 
      className="mobile-header desktop-hide"
      sx={{ 
        mb: 3,
        display: { xs: 'block', md: 'none' } 
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <IconButton 
          onClick={handleBack} 
          edge="start" 
          sx={{ 
            color: 'text.primary',
            bgcolor: 'background.paper',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            mr: 1,
            '&:active': { transform: 'scale(0.9)' }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography 
            className="mobile-page-title" 
            variant="h5" 
            component="h1"
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box>{action}</Box>
        )}
      </Stack>
    </Box>
  );
};
