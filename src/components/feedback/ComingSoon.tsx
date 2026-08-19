import { Box, Typography, Stack, alpha } from '@mui/material';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export function ComingSoon({
  title = 'Coming in v1.1',
  description = 'This feature is under development and will be available in the next release.',
}: ComingSoonProps) {
  return (
    <Box
      sx={{
        py: 6,
        px: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        border: '1px dashed',
        borderColor: alpha('#1e5c3a', 0.25),
        borderRadius: '20px',
        bgcolor: alpha('#1e5c3a', 0.02),
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            bgcolor: alpha('#1e5c3a', 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1e5c3a',
          }}
        >
          <HourglassEmptyOutlinedIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a2340', mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 380 }}>
            {description}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
