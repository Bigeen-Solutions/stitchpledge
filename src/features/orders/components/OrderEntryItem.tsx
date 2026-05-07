import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { truncateId, safeFormatDistanceToNow } from '../../../utils/format.ts';
import { DeadlineBadge } from './DeadlineBadge.tsx';

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
    unverified_flags?: string[];
  };
  onClick?: () => void;
}

const ActivationBadges: React.FC<{ flags?: string[] }> = ({ flags }) => {
  if (!flags || flags.length === 0) return null;

  return (
    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
      {flags.map((flag) => (
        <Box
          key={flag}
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: '4px',
            bgcolor: 'rgba(196, 154, 26, 0.1)',
            border: '1px solid rgba(196, 154, 26, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#c49a1a' }} />
          <Typography variant="caption" sx={{ color: '#c49a1a', fontWeight: 800, fontSize: '9px', textTransform: 'uppercase' }}>
            {flag}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

export const OrderEntryItem: React.FC<OrderEntryItemProps> = ({ order, onClick }) => {
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
          <DeadlineBadge orderId={order.id} />
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
          <ActivationBadges flags={order.unverified_flags} />
        </Stack>
        <div className="mobile-hide">
          <DeadlineBadge orderId={order.id} />
        </div>
      </div>

      <div className="card-footer">
        {order.eventDate && (
          <Stack spacing={0.5} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
              DEADLINE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
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
