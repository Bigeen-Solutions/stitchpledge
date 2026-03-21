import React from 'react';
import {
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { Card, Typography, Box, useTheme, Avatar } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

export type EntryType = 'INTAKE' | 'ADJUSTMENT' | 'MEASUREMENT' | 'LOCKED';

interface ImmutableTimelineEntryProps {
  entryType: EntryType;
  metadata: Record<string, any>;
  photoUrl?: string;
  timestamp: Date;
  author: string;
}

export function ImmutableTimelineEntry({
  entryType,
  metadata,
  photoUrl,
  timestamp,
  author,
}: ImmutableTimelineEntryProps) {
  const theme = useTheme();

  const getDotProps = () => {
    switch (entryType) {
      case 'INTAKE':
        return { variant: 'filled' as const, color: 'primary' as const };
      case 'ADJUSTMENT':
        return { variant: 'outlined' as const, sx: { borderColor: theme.palette.warning.main } };
      case 'MEASUREMENT':
      case 'LOCKED':
      default:
        return { variant: 'filled' as const, sx: { backgroundColor: theme.palette.secondary.main } };
    }
  };

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot {...getDotProps()} />
        <TimelineConnector sx={{ backgroundColor: theme.palette.secondary.main }} />
      </TimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: 2 }}>
        <Card variant="elevation" elevation={1} sx={{ position: 'relative', overflow: 'hidden' }}>
          {entryType === 'LOCKED' && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                p: 1,
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '0 0 0 8px',
              }}
            >
              <LockIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            </Box>
          )}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="overline" color="textSecondary">
                {entryType}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {timestamp.toLocaleString()}
              </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              {author}
            </Typography>

            {Object.entries(metadata).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">
                  {key}:
                </Typography>
                <Typography variant="body2">{String(value)}</Typography>
              </Box>
            ))}

            {photoUrl && (
              <Box sx={{ mt: 2 }}>
                <Avatar
                  src={photoUrl}
                  variant="rounded"
                  sx={{ width: 80, height: 80, border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </Box>
            )}
          </Box>
        </Card>
      </TimelineContent>
    </TimelineItem>
  );
}
