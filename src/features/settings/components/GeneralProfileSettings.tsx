import React from 'react';
import { 
  Box, 
  Typography, 
  Stack, 
  TextField, 
  MenuItem, 
  Grid, 
  Card,
  Button,
  alpha
} from '@mui/material';
import { 
  Business as BusinessIcon,
  Straighten as RulerIcon,
  Public as WorldIcon,
  Save as SaveIcon
} from '@mui/icons-material';

export function GeneralProfileSettings() {
  return (
    <Box>
      <header style={{ marginBottom: 32 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <BusinessIcon color="secondary" sx={{ fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>General Profile</Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Manage your company identity and default regional preferences.
        </Typography>
      </header>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            p: 4, 
            borderRadius: '24px', 
            border: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 10px 40px rgba(0,0,0,0.02)'
          }}>
            <Stack spacing={4}>
              {/* COMPANY NAME */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                  Company Name
                </Typography>
                <TextField 
                  fullWidth 
                  placeholder="Enter company name" 
                  defaultValue="StitchFlow Atelier"
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      bgcolor: alpha('#000', 0.01)
                    } 
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                  This name will appear on invoices and customer-facing portals.
                </Typography>
              </Box>

              {/* CANONICAL UNIT */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                  Default Canonical Unit
                </Typography>
                <TextField 
                  select
                  fullWidth 
                  defaultValue="cm"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      bgcolor: alpha('#000', 0.01)
                    } 
                  }}
                >
                  <MenuItem value="cm">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <RulerIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Typography variant="body2">Centimeters (cm)</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="in">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <RulerIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Typography variant="body2">Inches (in)</Typography>
                    </Stack>
                  </MenuItem>
                </TextField>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                  Global preference for all measurement inputs across the system.
                </Typography>
              </Box>

              {/* TIMEZONE */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                  System Timezone
                </Typography>
                <TextField 
                  select
                  fullWidth 
                  defaultValue="UTC"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px',
                      bgcolor: alpha('#000', 0.01)
                    } 
                  }}
                >
                  <MenuItem value="UTC">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WorldIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Typography variant="body2">Universal Coordinated Time (UTC)</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="EST">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WorldIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Typography variant="body2">Eastern Standard Time (EST)</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="BST">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WorldIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Typography variant="body2">British Summer Time (BST)</Typography>
                    </Stack>
                  </MenuItem>
                </TextField>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                  Determines deadline calculations and reporting timestamps.
                </Typography>
              </Box>

              <Box sx={{ pt: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<SaveIcon />}
                  sx={{ 
                    borderRadius: '12px', 
                    px: 4, 
                    py: 1.5,
                    fontWeight: 700,
                    boxShadow: '0 4px 14px 0 rgba(30, 92, 58, 0.39)'
                  }}
                  disabled
                >
                  Save Changes
                </Button>
                <Typography variant="caption" sx={{ ml: 2, color: 'text.disabled', fontStyle: 'italic' }}>
                  Configuration persistence coming in v1.1
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
