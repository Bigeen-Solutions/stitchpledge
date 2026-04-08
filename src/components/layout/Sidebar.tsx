import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Stack,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ContentCut as ScissorsIcon,
  Dashboard as LayoutDashboard,
  Assignment as ClipboardList,
  People as Users,
  Straighten as Ruler,
  Payment as CreditCard,
  ManageAccounts as UserCog,
  BarChart as BarChart2,
  Settings,
  Add as Plus,
} from '@mui/icons-material';
import { useAuthStore } from '../../features/auth/auth.store';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  toggleSidebar: () => void;
}

const SIDEBAR_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['COMPANY_ADMIN', 'STORE_MANAGER', 'TAILOR', 'CUSTOMER'] },
  { label: 'Orders', icon: ClipboardList, path: '/orders', roles: ['COMPANY_ADMIN', 'STORE_MANAGER', 'TAILOR'] },
  { label: 'New Order', icon: Plus, path: '/orders/new', roles: ['COMPANY_ADMIN', 'STORE_MANAGER', 'TAILOR'] },
  { label: 'Production', icon: ScissorsIcon, path: '/production', roles: ['COMPANY_ADMIN', 'STORE_MANAGER', 'TAILOR'] },
  { label: 'Customers', icon: Users, path: '/customers', roles: ['COMPANY_ADMIN', 'STORE_MANAGER'] },
  { label: 'Measurements', icon: Ruler, path: '/measurements', roles: ['COMPANY_ADMIN', 'STORE_MANAGER', 'TAILOR'] },
  { label: 'Payments', icon: CreditCard, path: '/payments', roles: ['COMPANY_ADMIN', 'STORE_MANAGER'] },
  { label: 'Staff / Tailors', icon: UserCog, path: '/staff', roles: ['COMPANY_ADMIN', 'STORE_MANAGER'] },
  { label: 'Reports', icon: BarChart2, path: '/reports', roles: ['COMPANY_ADMIN', 'STORE_MANAGER'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, toggleSidebar }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#163d28', color: 'white' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <IconButton onClick={toggleSidebar} sx={{ color: 'white' }}>
          <MenuIcon sx={{ fontSize: 24 }} />
        </IconButton>
        <Stack direction="row" spacing={1} alignItems="center">
          <ScissorsIcon sx={{ color: '#c49a1a', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
            StitchFlow
          </Typography>
        </Stack>
      </Box>

      {/* Navigation */}
      <List sx={{ flexGrow: 1, px: 0 }}>
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  py: 1.2,
                  px: 2,
                  bgcolor: isActive ? alpha('#1e5c3a', 0.15) : 'transparent',
                  borderLeft: isActive ? '3px solid #1e5c3a' : '3px solid transparent',
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.07),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'white' : alpha('#ffffff', 0.6) }}>
                  <item.icon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'white' : alpha('#ffffff', 0.6),
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Actions */}
      <Box sx={{ mt: 'auto' }}>
        <List sx={{ px: 0, pb: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation('/settings')}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': { bgcolor: alpha('#ffffff', 0.07) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: alpha('#ffffff', 0.6) }}>
                <Settings sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{ fontSize: '14px', color: alpha('#ffffff', 0.6) }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        {/* User Card */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha('#ffffff', 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: alpha('#000000', 0.1),
          }}
        >
          <Avatar
            src={user?.avatarUrl}
            sx={{ width: 40, height: 40, border: `1px solid ${alpha('#ffffff', 0.2)}` }}
          />
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
              {user?.fullName}
            </Typography>
            <Typography variant="caption" noWrap sx={{ display: 'block', color: alpha('#ffffff', 0.6) }}>
              {user?.role?.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRight: 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
