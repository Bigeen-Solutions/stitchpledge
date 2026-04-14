import React from 'react';
import { 
  Box, 
  SwipeableDrawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider,
  alpha
} from '@mui/material';
import { 
  BarChart as BarChartIcon, 
  People as PeopleIcon, 
  Settings as SettingsIcon, 
  History as HistoryIcon,
  Logout as LogoutIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/auth.store';

interface MoreDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const MoreDrawer: React.FC<MoreDrawerProps> = ({ open, onClose, onOpen }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const menuItems = [
    { label: 'Reports', icon: BarChartIcon, path: '/reports', roles: ['COMPANY_ADMIN', 'STORE_MANAGER'] },
    { label: 'Staff Management', icon: PeopleIcon, path: '/staff', roles: ['COMPANY_ADMIN', 'STORE_MANAGER'] },
    { label: 'Settings', icon: SettingsIcon, path: '/settings', roles: ['COMPANY_ADMIN', 'STORE_MANAGER'] },
    { label: 'Audit Log', icon: HistoryIcon, path: '/reports/audit', roles: ['COMPANY_ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      PaperProps={{
        sx: {
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          maxWidth: '600px',
          mx: 'auto',
          bgcolor: 'background.paper',
        }
      }}
    >
      <Box sx={{ p: 2, pb: 4 }}>
        <Box sx={{ 
          width: 40, 
          height: 4, 
          bgcolor: 'divider', 
          borderRadius: 2, 
          mx: 'auto', 
          mb: 3 
        }} />
        
        <Typography variant="caption" sx={{ 
          px: 2, 
          pb: 1, 
          display: 'block', 
          fontWeight: 800, 
          color: 'text.disabled',
          textTransform: 'uppercase',
          letterSpacing: 1
        }}>
          Workshop Utilities
        </Typography>

        <List sx={{ pt: 0 }}>
          {filteredItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton 
                onClick={() => handleNavigation(item.path)}
                sx={{ 
                  py: 2, 
                  borderRadius: '12px',
                  mb: 0.5,
                  '&:active': { bgcolor: alpha('#1e5c3a', 0.08) }
                }}
              >
                <ListItemIcon sx={{ minWidth: 44, color: 'primary.main' }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }} 
                />
                <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
              </ListItemButton>
            </ListItem>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleLogout}
              sx={{ 
                py: 2, 
                borderRadius: '12px',
                color: 'error.main',
                '&:active': { bgcolor: alpha('#d32f2f', 0.08) }
              }}
            >
              <ListItemIcon sx={{ minWidth: 44, color: 'inherit' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Sign Out" 
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }} 
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </SwipeableDrawer>
  );
};
