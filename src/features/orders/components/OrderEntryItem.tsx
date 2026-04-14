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
    <Box onClick={onClick} className="order-entry-card">
      <div className="card-top">
        <Stack spacing={0.5}>
          <Typography variant="caption" className="mobile-hide" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
            ORDER ID
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.dark' }}>
            #{truncateId(order.id).toUpperCase()}
          </Typography>
        </Stack>
        <div className="desktop-hide">
          <RiskBadge level={riskLevel} />
        </div>
      </div>

      <div className="card-body">
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
        <div className="mobile-hide">
          <RiskBadge level={riskLevel} />
        </div>
      </div>

      <div className="card-footer">
        {order.eventDate && (
          <Stack spacing={0.5} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
              DEADLINE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: riskLevel === 'OVERDUE' ? 'error.main' : 'text.primary' }}>
              {new Date(order.eventDate).toLocaleDateString()}
            </Typography>
          </Stack>
        )}
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '10px' }}>
          {order.createdAt ? safeFormatDistanceToNow(order.createdAt) : 'In production'}
        </Typography>
      </div>
    </Box>
  );
};
