import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  CircularProgress,
  alpha,
} from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import { useQuery } from '@tanstack/react-query';
import { sealApi } from '../seal.api';

interface FabricSealPanelProps {
  orderId: string;
  garmentId: string;
}

const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_BASE_URL ?? window.location.origin;

function handleShare(verificationCode: string) {
  const url = `${PUBLIC_BASE_URL}/public/seals/${verificationCode}`;
  const text = `My fabric is protected by StitchPledge. Verify at: ${url}`;

  if (navigator.share) {
    navigator.share({ text }).catch(() => {/* user cancelled */});
  } else {
    window.open(`sms:?body=${encodeURIComponent(text)}`);
  }
}

export function FabricSealPanel({ orderId, garmentId }: FabricSealPanelProps) {
  const { data: seal, isLoading, error } = useQuery({
    queryKey: ['seal', orderId, garmentId],
    queryFn: () => sealApi.getGarmentSeal(orderId, garmentId),
    retry: (failureCount, err: any) => {
      if (err?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const is404 = (error as any)?.response?.status === 404;

  return (
    <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'block' }}
      >
        Fabric Safety Seal
      </Typography>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={20} />
        </Box>
      )}

      {(is404 || (!seal && !isLoading)) && (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
          <ShieldOutlinedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
          <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
            Seal generates automatically when the customer confirms fabric
          </Typography>
        </Stack>
      )}

      {seal && (
        <Stack spacing={2}>
          {/* QR code + code side by side on desktop, stacked on mobile */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Box
              component="img"
              src={seal.qrCodeDataUrl}
              alt={`QR code for seal ${seal.verificationCode}`}
              sx={{ width: 160, height: 160, display: 'block', flexShrink: 0 }}
            />
            <Stack spacing={0.75}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', fontSize: '10px', letterSpacing: 1 }}
              >
                Verification Code
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#1e5c3a',
                  letterSpacing: '0.05em',
                  lineHeight: 1.2,
                }}
              >
                {seal.verificationCode}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                Generated {new Date(seal.generatedAt).toLocaleDateString('en-NG', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SmsOutlinedIcon />}
                onClick={() => handleShare(seal.verificationCode)}
                sx={{
                  mt: 0.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '11px',
                  textTransform: 'none',
                  alignSelf: 'flex-start',
                  borderColor: alpha('#1e5c3a', 0.4),
                  color: '#1e5c3a',
                  '&:hover': { borderColor: '#1e5c3a', bgcolor: alpha('#1e5c3a', 0.04) },
                }}
              >
                Share via SMS
              </Button>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
