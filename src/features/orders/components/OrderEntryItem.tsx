import React from 'react';
import { Box, Typography, Stack, alpha } from '@mui/material';
import { RiskBadge, type RiskLevel } from '../../../components/ui/RiskBadge.tsx';
import { truncateId, safeFormatDistanceToNow } from '../../../utils/format.ts';

interface OrderEntryItemProps {
  order: {
    id: string;
    orderNumber?: number | string;
    customerName: string;
    garmentName: string;
    status: string;
    riskLevel?: string;
    eventDate: string;
    createdAt?: string;
  };
  onClick?: () => void;
}

export const OrderEntryItem: React.FC<OrderEntryItemProps> = ({ order, onClick }) => {
  const riskLevel = (order.status === 'COMPLETED' ? 'ON_TRACK' : (order.riskLevel || 'ON_TRACK')) as RiskLevel;
  
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2.5,
        mb: 2,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: alpha('#fff', 0.6),
        backdropFilter: 'blur(10px)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          borderColor: 'primary.main',
          boxShadow: `0 8px 20px ${alpha('#1e5c3a', 0.1)}`,
          bgcolor: alpha('#fff', 0.8),
        } : {},
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2
      }}
      className="sf-glass"
    >
      <Stack spacing={0.5} sx={{ minWidth: 120 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
          ORDER ID
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.dark' }}>
          #{truncateId(order.id).toUpperCase()}
        </Typography>
      </Stack>

      <Stack spacing={0.5} sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {order.customerName}
        </Typography>
        {order.garmentName && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {order.garmentName}
          </Typography>
        )}
      </Stack>

      {order.eventDate && (
        <Stack spacing={0.5} sx={{ textAlign: 'right', minWidth: 140 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
            DEADLINE
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 800, color: riskLevel === 'OVERDUE' ? 'error.main' : 'text.primary' }}>
            {new Date(order.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Typography>
        </Stack>
      )}

      <Stack spacing={1} alignItems="flex-end" sx={{ minWidth: 120 }}>
        <RiskBadge level={riskLevel} />
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '10px' }}>
          {order.createdAt ? safeFormatDistanceToNow(order.createdAt) : 'In production'}
        </Typography>
      </Stack>
    </Box>
  );
};
