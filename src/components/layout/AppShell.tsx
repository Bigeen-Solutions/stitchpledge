import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box className="app-shell-root">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} toggleSidebar={toggleSidebar} />

      <Box
        component="main"
        className="main-content"
        sx={{
          ...(sidebarOpen && !isMobile && {
            width: `calc(100% - 240px)`,
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <TopBar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <Box className="content-container">
          {children}
        </Box>
      </Box>
    </Box>
  );
};
