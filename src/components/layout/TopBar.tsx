import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  CalendarMonth as Calendar,
  Notifications as Bell,
  HelpOutline as HelpCircle,
  Download,
  Logout as LogOut,
  Person as User,
} from '@mui/icons-material';
import { useAuthStore } from '../../features/auth/auth.store';
import { useLogout } from '../../features/auth/hooks/useAuth';

interface TopBarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user } = useAuthStore();
  const logout = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileClose();
    logout.mutate();
  };

  const isAdmin = user?.role === 'COMPANY_ADMIN';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#fafaf8',
        borderBottom: '1px solid #e5e4e0',
        color: '#1a2340',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ height: 64, px: { xs: 1, md: 3 } }}>
        {!isSidebarOpen && (
          <IconButton
            onClick={toggleSidebar}
            edge="start"
            sx={{ mr: 2, color: '#1a2340' }}
          >
            <MenuIcon sx={{ fontSize: 24 }} />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Dashboard
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
          {isAdmin && (
            <Chip
              icon={<Calendar sx={{ fontSize: 16, color: '#c49a1a !important' }} />}
              label={new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
              variant="outlined"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                borderColor: '#c49a1a',
                color: '#1a2340',
                fontWeight: 500,
                height: 36,
                borderRadius: '8px',
              }}
            />
          )}

          <IconButton size="small" sx={{ color: '#6b7280' }}>
            <Badge variant="dot" color="error">
              <Bell sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>

          <IconButton size="small" sx={{ color: '#6b7280', display: { xs: 'none', sm: 'flex' } }}>
            <HelpCircle sx={{ fontSize: 20 }} />
          </IconButton>

          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<Download sx={{ fontSize: 18 }} />}
              sx={{
                display: { xs: 'none', md: 'flex' },
                bgcolor: '#1e5c3a',
                height: 36,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#256b45', boxShadow: 'none' },
              }}
            >
              Export Report
            </Button>
          )}

          <IconButton onClick={handleProfileClick} sx={{ p: 0.5 }}>
            <Avatar
              src={user?.avatarUrl}
              sx={{ width: 36, height: 36, bgcolor: '#1e5c3a' }}
            >
              {user?.fullName?.charAt(0)}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileClose}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 180,
              filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.1))',
              border: '1px solid #e5e4e0',
              borderRadius: '12px',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfileClose}>
            <ListItemIcon>
              <User sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
            <ListItemIcon>
              <LogOut sx={{ fontSize: 18, color: '#d32f2f' }} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
