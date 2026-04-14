import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  alpha
} from '@mui/material';
import FactoryIcon from '@mui/icons-material/Factory';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { isPast, differenceInHours, format } from 'date-fns';

import { useActiveTasks, useMarkStageComplete } from '../features/workflow/hooks/useProductionBoard';
import type { ActiveFloorTask } from '../features/workflow/workflow.api';
import { WorkflowGraph } from '../features/workflow/components/WorkflowGraph';
import { useStaffList } from '../features/auth/hooks/useStaff';
import { useGarmentWorkflow, useUpdateGarmentStage } from '../features/workflow/hooks/useWorkflowMutation';
import '../design-system/layout.css'; // Ensure sf-glass is available

// ─── Constants & Helpers ────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; bgColor: string }> = {
  'Cutting': { color: '#0070f3', bgColor: '#e6f2ff' },
  'Sewing': { color: '#7928ca', bgColor: '#f3e8ff' },
  'Fitting': { color: '#f5a623', bgColor: '#fff5e6' },
  'Finishing': { color: '#00bfa5', bgColor: '#e6fffa' },
  'Default': { color: '#666', bgColor: '#f0f0f0' },
};

const getStatusStyles = (status: string) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG['Default'];
};

const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

const isAtRisk = (deadline: string, status?: string) => {
  if (!deadline || status === 'COMPLETED') return false;
  const d = new Date(deadline);
  const now = new Date();
  return isPast(d) || differenceInHours(d, now) < 24;
};

const formatTableDate = (dateStr?: string) => {
  if (!dateStr) return '--';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
};

// ─── KPI Card Component ─────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
}

function KPICard({ title, value, icon, gradient }: KPICardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        background: gradient,
        borderRadius: '24px',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease',
        '&:hover': { transform: 'translateY(-5px)' }
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: -10,
        right: -10,
        opacity: 0.1,
        transform: 'rotate(15deg)',
        '& svg': { fontSize: 100 }
      }}>
        {icon}
      </Box>
      <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 800, letterSpacing: 1.2 }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
          {value}
        </Typography>
      </Box>
    </Card>
  );
}

// ─── Quick Update Modal ──────────────────────────────────────────
interface QuickUpdateModalProps {
  task: ActiveFloorTask | null;
  onClose: () => void;
}

function QuickUpdateModal({ task, onClose }: QuickUpdateModalProps) {
  const { data: workflow, isLoading: isWorkflowLoading } = useGarmentWorkflow(task?.garmentId || '');
  const { data: staff, isLoading: isStaffLoading, isError: isStaffError } = useStaffList({
    storeId: task?.storeId,
    enabled: !!task && !!task.storeId
  });
  const updateMutation = useUpdateGarmentStage(task?.garmentId || '');

  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedTailorId, setSelectedTailorId] = useState<string | null>(null);

  // Sync initial state when task changes or workflow data arrives
  useMemo(() => {
    if (task) {
      setSelectedStageId(task.stageId);
      setSelectedTailorId(task.assignedTailorId || null);
    }
  }, [task]);

  if (!task) return null;

  const isStoreIdMissing = !task.storeId;

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      stageId: selectedStageId,
      assignedTailorId: selectedTailorId,
    });
    onClose();
  };

  const stages = workflow?.stages || [];
  const tailors = staff?.filter(s => s.role === 'TAILOR') || [];

  return (
    <Dialog
      open={!!task}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundImage: 'none',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.3)'
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3 }}>
        <Typography variant="h6" fontWeight={800} color="text.primary">
          Update Garment Status
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {task.garmentName} — {task.customerName}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 1 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
              Workflow Status
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                disabled={isWorkflowLoading}
                sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
                displayEmpty
              >
                {isWorkflowLoading ? (
                  <MenuItem disabled value="">
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Loading Stages...
                  </MenuItem>
                ) : (
                  stages.map((s) => (
                    <MenuItem key={s.stageId} value={s.stageId}>
                      {s.stageId.charAt(0).toUpperCase() + s.stageId.slice(1)}
                    </MenuItem>
                  ))
                )}
                {stages.length === 0 && !isWorkflowLoading && (
                  <MenuItem disabled value="">No stages found</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
              Assigned Tailor
            </Typography>
            <FormControl fullWidth size="small" error={isStoreIdMissing || isStaffError}>
              <Select
                value={selectedTailorId || ''}
                onChange={(e) => setSelectedTailorId(e.target.value || null)}
                disabled={isStaffLoading || isStoreIdMissing}
                sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
                displayEmpty
              >
                {isStoreIdMissing ? (
                   <MenuItem disabled value="">
                    Store ID Missing - Contact Admin
                  </MenuItem>
                ) : (
                  <>
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {isStaffLoading ? (
                      <MenuItem disabled value="">
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Loading Staff...
                      </MenuItem>
                    ) : (
                      tailors.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.email.split('@')[0]}
                        </MenuItem>
                      ))
                    )}
                  </>
                )}
              </Select>
              {isStoreIdMissing && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, fontWeight: 600 }}>
                  Critical: This task is missing a store assignment.
                </Typography>
              )}
            </FormControl>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={updateMutation.isPending || isWorkflowLoading}
          sx={{
            bgcolor: 'primary.main',
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Execution Modal (Legacy - Kept for Reference or Stage Completion) ────────
interface ExecutionDialogProps {
  task: ActiveFloorTask | null;
  onClose: () => void;
}

function ExecutionDialog({ task, onClose }: ExecutionDialogProps) {
  const markComplete = useMarkStageComplete();

  if (!task) return null;

  const handleComplete = async () => {
    await markComplete.mutateAsync({ garmentId: task.garmentId, stageId: task.stageId });
    onClose();
  };

  return (
    <Dialog
      open={!!task}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, backgroundImage: 'none' },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FactoryIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {task.stageName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {task.garmentName} — {task.customerName}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <WorkflowGraph garmentId={task.garmentId} orderId={task.orderId} />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={markComplete.isPending}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleComplete}
          disabled={markComplete.isPending}
          startIcon={markComplete.isPending ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon />}
          sx={{ minWidth: 160, borderRadius: 3 }}
        >
          {markComplete.isPending ? 'Syncing...' : 'Mark Complete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Task Mobile Card ───────────────────────────────────────────

interface TaskMobileCardProps {
  task: ActiveFloorTask;
  onQuickUpdate: () => void;
  navigate: (path: string) => void;
}

function TaskMobileCard({ task, onQuickUpdate, navigate }: TaskMobileCardProps) {
  const atRisk = isAtRisk(task.deadline, task.status);
  const statusStyle = getStatusStyles(task.stageName);

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: '20px',
        mb: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: atRisk ? 'error.light' : 'divider',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        '&:active': { transform: 'scale(0.98)', bgcolor: alpha('#1e5c3a', 0.04) }
      }}
    >
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Avatar
          src={task.fabric_image_base64}
          variant="rounded"
          sx={{
            width: 56,
            height: 56,
            borderRadius: '12px',
            bgcolor: stringToColor(task.garmentName || 'G'),
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}
        >
          {task.garmentName?.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>
              #{task.orderNumber}
            </Typography>
            <Chip
              label={task.stageName}
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 800,
                color: statusStyle.color,
                bgcolor: statusStyle.bgColor,
                borderRadius: '6px'
              }}
            />
          </Stack>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
            {task.customerName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {task.garmentName}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 24, height: 24, fontSize: 10, bgcolor: 'primary.main', fontWeight: 700 }}>
            {task.tailorEmail?.[0].toUpperCase() || '?'}
          </Avatar>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {task.tailorEmail ? task.tailorEmail.split('@')[0] : 'Unassigned'}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{
          color: atRisk ? 'error.main' : 'text.disabled',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}>
          <ScheduleIcon sx={{ fontSize: 14 }} />
          {task.deadline ? format(new Date(task.deadline), 'MMM d') : '--'}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.5}>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={() => navigate(`/orders/${task.orderId}`)}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, borderColor: 'divider' }}
        >
          View Details
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          size="small"
          onClick={onQuickUpdate}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
        >
          Update
        </Button>
      </Stack>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────

export function ProductionBoardPage() {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading, isError } = useActiveTasks();
  const [selectedTask, setSelectedTask] = useState<ActiveFloorTask | null>(null);
  const [quickUpdateTask, setQuickUpdateTask] = useState<ActiveFloorTask | null>(null);

  // Local Filtering & Pagination State
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [lifecycleStatusFilter, setLifecycleStatusFilter] = useState('All');
  const [tailorFilter, setTailorFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Derive KPIs
  const kpis = useMemo(() => {
    const active = tasks.length;
    const dueToday = tasks.filter(t => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length;
    const fittings = tasks.filter(t => t.stageName === 'Fitting').length;

    return [
      { title: 'In Production', value: active, icon: <QueryStatsIcon />, gradient: 'linear-gradient(135deg, #7da8cdff 0%, #48889fff 100%)' },
      { title: 'Due Today', value: dueToday, icon: <ScheduleIcon />, gradient: 'linear-gradient(135deg, #e97078ff 0%, #de3b87ff 100%)' },
      { title: 'Fittings', value: fittings, icon: <EventIcon />, gradient: 'linear-gradient(135deg, #ed9140ff 0%, #f0df8cff 100%)' },
      { title: 'Success rate', value: '98%', icon: <CheckCircleIcon />, gradient: 'linear-gradient(135deg, #27892dff 0%, #75ea7bff 100%)' },
    ];
  }, [tasks]);

  // Derive Available Filters Dynamically
  const uniqueStages = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.stageName))).sort();
  }, [tasks]);

  const uniqueTailors = useMemo(() => {
    const tailorMap = new Map();
    tasks.forEach(t => {
      if (t.assignedTailorId && t.tailorEmail) {
        tailorMap.set(t.assignedTailorId, t.tailorEmail.split('@')[0]);
      }
    });
    return Array.from(tailorMap.entries());
  }, [tasks]);

  const lifecycleStatuses = ['PENDING', 'ACTIVE', 'COMPLETED', 'BLOCKED'];

  // Handle Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const orderId = task.orderId || '';
      const orderNumber = String(task.orderNumber || '');
      const customerName = task.customerName || '';
      const searchStr = search.toLowerCase();

      const matchesSearch =
        orderId.toLowerCase().includes(searchStr) ||
        orderNumber.includes(searchStr) ||
        customerName.toLowerCase().includes(searchStr);

      const matchesStage = stageFilter === 'All' || task.stageName === stageFilter;
      const matchesLifecycle = lifecycleStatusFilter === 'All' || task.status === lifecycleStatusFilter;
      const matchesTailor = tailorFilter === 'All' || task.assignedTailorId === tailorFilter;

      return matchesSearch && matchesStage && matchesLifecycle && matchesTailor;
    });
  }, [tasks, search, stageFilter, lifecycleStatusFilter, tailorFilter]);

  // Handle Pagination
  const paginatedTasks = useMemo(() => {
    return filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredTasks, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1,2,3,4].map(i => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: '24px' }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '24px' }} />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error" sx={{ m: 4, borderRadius: '12px' }}>Failed to load Production Ledger. Please retry.</Alert>;
  }

  return (
    <Box sx={{ p: { xs: 2.5, md: 4, lg: 6 }, maxWidth: 1600, mx: 'auto', pb: 12 }}>

      {/* 1. Page Header (Sticky Control strip) */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: alpha('#f8f9fa', 0.9),
        backdropFilter: 'blur(20px)',
        mx: { xs: -2.5, md: -4, lg: -6 },
        px: { xs: 2.5, md: 4, lg: 6 },
        pt: 2,
        pb: 3,
        mb: 4,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={3}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.04em' }}>
              Production Store
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Atelier workflow & real-time telemetry
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search ID, Client..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', md: 320 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }
              }}
            />
            <IconButton sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: '14px', width: 44, height: 44 }}>
              <NotificationsNoneIcon sx={{ color: 'text.secondary' }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* 2. KPI Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {kpis.map((kpi, idx) => (
          <Grid size={{ xs: 6, lg: 3 }} key={idx}>
            <KPICard title={kpi.title} value={kpi.value} gradient={kpi.gradient} icon={kpi.icon} />
          </Grid>
        ))}
      </Grid>

      {/* 3. Operational Filters */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        mb: 4,
        overflowX: 'auto',
        pb: 1,
        '&::-webkit-scrollbar': { display: 'none' }
      }}>
        <Select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          size="small"
          sx={{ minWidth: { xs: '100%', md: 180 }, borderRadius: '12px', bgcolor: 'white' }}
        >
          <MenuItem value="All">All Stages</MenuItem>
          {uniqueStages.map((stage) => (
            <MenuItem key={stage} value={stage}>{stage}</MenuItem>
          ))}
        </Select>

        <Select
          value={lifecycleStatusFilter}
          onChange={(e) => setLifecycleStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: { xs: '100%', md: 160 }, borderRadius: '12px', bgcolor: 'white' }}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          {lifecycleStatuses.map((status) => (
            <MenuItem key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </MenuItem>
          ))}
        </Select>

        <Select
          value={tailorFilter}
          onChange={(e) => setTailorFilter(e.target.value)}
          size="small"
          sx={{ minWidth: { xs: '100%', md: 160 }, borderRadius: '12px', bgcolor: 'white' }}
        >
          <MenuItem value="All">All Tailors</MenuItem>
          {uniqueTailors.map(([id, email]) => (
            <MenuItem key={id} value={id}>{email}</MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          sx={{
            bgcolor: 'secondary.main',
            color: 'white',
            borderRadius: '12px',
            px: 3,
            fontWeight: 800,
            boxShadow: '0 4px 15px rgba(196, 154, 26, 0.2)',
            ml: { md: 'auto' }
          }}
        >
          Export Ledger
        </Button>
      </Box>

      {/* 4. Production Data Display (Liquid Desktop vs Mobile Cards) */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {paginatedTasks.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center', bgcolor: 'white', borderRadius: '24px', border: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ color: 'text.disabled', fontWeight: 600 }}>No production tasks matching criteria.</Typography>
          </Box>
        ) : (
          paginatedTasks.map(task => (
            <TaskMobileCard
              key={task.stageInstanceId}
              task={task}
              onQuickUpdate={() => setQuickUpdateTask(task)}
              navigate={navigate}
            />
          ))
        )}
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer
          sx={{
            bgcolor: 'white',
            borderRadius: '24px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: alpha('#f3f4f6', 0.5) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>IDENTIFIER</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>CLIENT & GARMENT</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>CURRENT STAGE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>SCHEDULE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>ASSIGNMENT</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTasks.map((task) => {
                const statusStyle = getStatusStyles(task.stageName);
                const atRisk = isAtRisk(task.deadline, task.status);

                return (
                  <TableRow
                    key={task.stageInstanceId}
                    hover
                    sx={{
                      '&:hover': { bgcolor: alpha('#1e5c3a', 0.02) },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell>
                      <Link
                        to={`/orders/${task.orderId}`}
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: atRisk ? 'error.main' : 'success.main'
                        }} />
                        <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary' }}>
                          #{task.orderNumber}
                        </Typography>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={task.fabric_image_base64}
                          variant="rounded"
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            bgcolor: stringToColor(task.garmentName || 'G'),
                            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                          }}
                        >
                          {task.garmentName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{task.customerName}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{task.garmentName}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.stageName}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          color: statusStyle.color,
                          bgcolor: statusStyle.bgColor,
                          borderRadius: '8px',
                          px: 0.5
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: atRisk ? 'error.main' : 'text.primary' }}>
                          {formatTableDate(task.deadline)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          Started {formatTableDate(task.startDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {task.tailorEmail ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 24, height: 24, fontSize: 10, bgcolor: 'primary.main', fontWeight: 700 }}>
                            {task.tailorEmail[0].toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{task.tailorEmail.split('@')[0]}</Typography>
                        </Stack>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>Awaiting Assignment</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Command Center">
                          <IconButton size="small" onClick={() => navigate(`/orders/${task.orderId}`)} sx={{ bgcolor: alpha('#000', 0.02) }}>
                            <VisibilityIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Quick Update">
                          <IconButton size="small" onClick={() => setQuickUpdateTask(task)} sx={{ bgcolor: alpha('#c49a1a', 0.05), color: 'secondary.main' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider' }}>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredTasks.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ border: 'none' }}
            />
          </Box>
        </TableContainer>
      </Box>

      {/* Modals & Dialogs */}
      <ExecutionDialog task={selectedTask} onClose={() => setSelectedTask(null)} />
      <QuickUpdateModal task={quickUpdateTask} onClose={() => setQuickUpdateTask(null)} />
    </Box>
  );
}
