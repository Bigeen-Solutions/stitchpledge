import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Stack, 
  Tabs, 
  Tab, 
  Paper,
  alpha
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Business as GeneralIcon,
  AccountTree as WorkshopIcon
} from '@mui/icons-material';
import { WorkshopConfiguration } from '../features/workflow/components/WorkshopConfiguration';
import { GeneralProfileSettings } from '../features/settings/components/GeneralProfileSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      style={{ height: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="container" sx={{ py: 4 }}>
      <header style={{ marginBottom: 40 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Settings Hub</Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
          Centralized administration for production workflows and company configuration.
        </Typography>
      </header>

      <Paper className="sf-glass" sx={{ 
        display: 'flex', 
        minHeight: '70vh', 
        borderRadius: '32px', 
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.4)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
        bgcolor: alpha('#fff', 0.8)
      }}>
        {/* Navigation Pane */}
        <Box sx={{ 
          width: 280, 
          borderRight: '1px solid', 
          borderColor: 'divider',
          bgcolor: alpha('#f8fbf9', 0.5),
          p: 2
        }}>
          <Typography variant="caption" sx={{ 
            px: 2, 
            py: 1.5, 
            display: 'block', 
            fontWeight: 800, 
            color: 'text.disabled',
            textTransform: 'uppercase',
            letterSpacing: 1.5
          }}>
            Administration
          </Typography>
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                width: 4,
                borderRadius: '0 4px 4px 0',
                left: 0,
                bgcolor: 'primary.main'
              },
              '& .MuiTab-root': {
                alignItems: 'flex-start',
                textAlign: 'left',
                justifyContent: 'flex-start',
                minHeight: 56,
                borderRadius: '12px',
                px: 2,
                color: 'text.secondary',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: 'primary.main',
                  bgcolor: alpha('#1e5c3a', 0.08),
                },
                '&:hover': {
                  bgcolor: alpha('#1e5c3a', 0.04),
                }
              }
            }}
          >
            <Tab 
              icon={<WorkshopIcon sx={{ mr: 1.5, fontSize: 20 }} />} 
              iconPosition="start" 
              label={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Workshop Config</Typography>} 
            />
            <Tab 
              icon={<GeneralIcon sx={{ mr: 1.5, fontSize: 20 }} />} 
              iconPosition="start" 
              label={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>General Profile</Typography>} 
            />
          </Tabs>
        </Box>

        {/* Content Pane */}
        <Box sx={{ flex: 1, p: 6, bgcolor: 'transparent', overflowY: 'auto' }}>
          <CustomTabPanel value={activeTab} index={0}>
            <WorkshopConfiguration />
          </CustomTabPanel>
          <CustomTabPanel value={activeTab} index={1}>
            <GeneralProfileSettings />
          </CustomTabPanel>
        </Box>
      </Paper>
    </Box>
  );
};
