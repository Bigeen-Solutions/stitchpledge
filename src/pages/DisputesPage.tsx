import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Alert,
  AlertTitle,
  Chip,
  Card,
  Button,
  Skeleton,
  Pagination,
  Tabs,
  Tab,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  ArrowForward as ArrowForwardIcon,
  AcUnit as AcUnitIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useDisputesList,
  type DisputeListItem,
  type DisputeStatus,
} from '../features/dispute/dispute.hooks';

const ITEMS_PER_PAGE = 10;

type FilterTab = 'ALL' | 'ACTIVE' | 'RESOLVED';

const ACTIVE_STATUSES: DisputeStatus[] = ['OPEN', 'EVIDENCE_REQUIRED', 'UNDER_REVIEW'];
const RESOLVED_STATUSES: DisputeStatus[] = ['RESOLVED', 'TERMINATED'];

function getStatusConfig(status: DisputeStatus) {
  switch (status) {
    case 'OPEN':
      return { label: 'Open', color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)', icon: <AcUnitIcon sx={{ fontSize: 12 }} /> };
    case 'EVIDENCE_REQUIRED':
      return { label: 'Evidence Required', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)', icon: <AcUnitIcon sx={{ fontSize: 12 }} /> };
    case 'UNDER_REVIEW':
      return { label: 'Under Review', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)', icon: <AcUnitIcon sx={{ fontSize: 12 }} /> };
    case 'RESOLVED':
      return { label: 'Resolved', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)', icon: <CheckCircleIcon sx={{ fontSize: 12 }} /> };
    case 'TERMINATED':
      return { label: 'Terminated', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', icon: <BlockIcon sx={{ fontSize: 12 }} /> };
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'MATERIAL': return '#7c3aed';
    case 'MEASUREMENT': return '#0891b2';
    case 'FINANCIAL': return '#dc2626';
    case 'AESTHETIC': return '#d97706';
    default: return '#6b7280';
  }
}

interface DisputeCardProps {
  dispute: DisputeListItem;
  onViewOrder: (orderId: string) => void;
}

const DisputeCard: React.FC<DisputeCardProps> = ({ dispute, onViewOrder }) => {
  const statusConfig = getStatusConfig(dispute.status);
  const isActive = ACTIVE_STATUSES.includes(dispute.status);
  const categoryColor = getCategoryColor(dispute.category);

  return (
    <Card
      className="sf-glass"
      sx={{
        p: 3,
        borderRadius: '20px',
        border: '1px solid',
        borderColor: isActive ? alpha('#d97706', 0.3) : 'rgba(255, 255, 255, 0.3)',
        bgcolor: isActive ? alpha('#fffbeb', 0.6) : 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        boxShadow: isActive
          ? '0 4px 20px rgba(217, 119, 6, 0.08)'
          : '0 4px 20px rgba(0, 0, 0, 0.03)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isActive
            ? '0 8px 30px rgba(217, 119, 6, 0.12)'
            : '0 8px 30px rgba(0, 0, 0, 0.06)',
        },
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Top row: category + severity + status */}
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
            <Chip
              label={dispute.category}
              size="small"
              sx={{
                height: 22,
                fontSize: '10px',
                fontWeight: 800,
                bgcolor: alpha(categoryColor, 0.1),
                color: categoryColor,
                borderRadius: '6px',
                letterSpacing: '0.05em',
              }}
            />
            <Chip
              label={dispute.severity}
              size="small"
              sx={{
                height: 22,
                fontSize: '10px',
                fontWeight: 800,
                bgcolor: dispute.severity === 'CRITICAL' ? alpha('#dc2626', 0.1) : alpha('#d97706', 0.1),
                color: dispute.severity === 'CRITICAL' ? '#dc2626' : '#d97706',
                borderRadius: '6px',
                letterSpacing: '0.05em',
              }}
            />
            <Chip
              label={statusConfig?.label}
              size="small"
              icon={statusConfig?.icon}
              sx={{
                height: 22,
                fontSize: '10px',
                fontWeight: 700,
                bgcolor: statusConfig?.bg,
                color: statusConfig?.color,
                borderRadius: '6px',
                '& .MuiChip-icon': { color: 'inherit', ml: '6px' },
              }}
            />
          </Stack>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: '#1a2340',
              fontWeight: 500,
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {dispute.description}
          </Typography>

          {/* Meta row */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              Order{' '}
              <Box component="span" sx={{ color: '#1e5c3a', fontWeight: 800 }}>
                #{dispute.orderId.slice(-8).toUpperCase()}
              </Box>
            </Typography>
            {isActive && (
              <Tooltip title="Days production has been frozen" placement="top">
                <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 700 }}>
                  {dispute.daysInStandoff === 0 ? 'Opened today' : `${dispute.daysInStandoff}d in standoff`}
                </Typography>
              </Tooltip>
            )}
            <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
              {new Date(dispute.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Typography>
          </Stack>
        </Box>

        {/* Action */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            onClick={() => onViewOrder(dispute.orderId)}
            sx={{
              color: '#1e5c3a',
              fontWeight: 700,
              fontSize: '12px',
              textTransform: 'none',
              borderRadius: '10px',
              px: 2,
              py: 0.8,
              bgcolor: alpha('#1e5c3a', 0.06),
              '&:hover': { bgcolor: alpha('#1e5c3a', 0.12) },
              whiteSpace: 'nowrap',
            }}
          >
            View Order
          </Button>
        </Box>
      </Stack>
    </Card>
  );
};

export const DisputesPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const { data, isLoading } = useDisputesList(page, ITEMS_PER_PAGE);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (activeTab === 'ACTIVE') return data.items.filter((d) => ACTIVE_STATUSES.includes(d.status));
    if (activeTab === 'RESOLVED') return data.items.filter((d) => RESOLVED_STATUSES.includes(d.status));
    return data.items;
  }, [data?.items, activeTab]);

  const activeCount = useMemo(
    () => data?.items.filter((d) => ACTIVE_STATUSES.includes(d.status)).length ?? 0,
    [data?.items]
  );

  const handleTabChange = (_: React.SyntheticEvent, value: FilterTab) => {
    setActiveTab(value);
    setPage(1);
  };

  return (
    <Box className="container" sx={{ py: 4 }}>
      <header style={{ marginBottom: 32 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
          <GavelIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography
            variant="h4"
            className="mobile-page-title"
            sx={{ fontSize: { xs: '1.25rem', md: '2.125rem' }, fontWeight: 800 }}
          >
            Dispute Resolution Portal
          </Typography>
          {activeCount > 0 && (
            <Chip
              label={`${activeCount} active`}
              size="small"
              sx={{
                height: 24,
                fontSize: '11px',
                fontWeight: 800,
                bgcolor: alpha('#d97706', 0.12),
                color: '#d97706',
                borderRadius: '8px',
              }}
            />
          )}
        </Stack>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
          Structured Arbitration Lifecycle. Manage production standoffs and track cryptographic resolution tokens.
        </Typography>
      </header>

      {activeCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
          <AlertTitle sx={{ fontWeight: 700 }}>Arbitration State Machine Active</AlertTitle>
          {activeCount} active {activeCount === 1 ? 'dispute' : 'disputes'} currently {activeCount === 1 ? 'suspends' : 'suspend'} production
          workflows via Trust Gates. Unlocking orders requires a verified Resolution Token.
        </Alert>
      )}

      {/* Filter Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          '& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3, borderRadius: '3px 3px 0 0' },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '13px',
            minHeight: 44,
            color: 'text.secondary',
            '&.Mui-selected': { color: 'primary.main' },
          },
        }}
      >
        <Tab label="All Disputes" value="ALL" />
        <Tab label="Active / Frozen" value="ACTIVE" />
        <Tab label="Resolved" value="RESOLVED" />
      </Tabs>

      {/* Content */}
      {isLoading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={110} sx={{ borderRadius: '20px' }} />
          ))}
        </Stack>
      ) : filteredItems.length === 0 ? (
        <Card
          className="sf-glass"
          sx={{
            p: 6,
            borderRadius: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '30vh',
            border: '1px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          <GavelIcon sx={{ fontSize: 48, color: alpha('#1e5c3a', 0.2), mb: 2 }} />
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
            {activeTab === 'ALL'
              ? 'No disputes found. The workshop is operating under full Trust parameters.'
              : activeTab === 'ACTIVE'
              ? 'No active disputes. All workflows are unblocked.'
              : 'No resolved disputes on record yet.'}
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {filteredItems.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              onViewOrder={(orderId) => navigate(`/orders/${orderId}`)}
            />
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {!isLoading && data && data.totalPages > 1 && activeTab === 'ALL' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={data.totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 700,
                borderRadius: '10px',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};
