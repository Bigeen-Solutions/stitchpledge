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
  Paper,
  Tooltip,
} from '@mui/material';
import FactoryIcon from '@mui/icons-material/Factory';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
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
import { useAuthStore } from '../features/auth/auth.store';
import { usePermissions } from '../features/auth/use-permissions';
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

const isAtRisk = (deadline: string) => {
  if (!deadline) return false;
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
  accentColor: string;
}

function KPICard({ title, value, icon, accentColor }: KPICardProps) {
  return (
    <Card
      elevation={0}
      className="sf-glass"
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 3,
        height: '100%',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="overline" color="text.secondary" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={800}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: accentColor, opacity: 0.8 }}>
          {icon}
        </Box>
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
  const { role } = usePermissions();
  const user = useAuthStore((state) => state.user);
  const { data: workflow, isLoading: isWorkflowLoading } = useGarmentWorkflow(task?.garmentId || '');
  const { data: staff, isLoading: isStaffLoading } = useStaffList({ enabled: !!task });
  const updateMutation = useUpdateGarmentStage(task?.garmentId || '');

  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedTailorId, setSelectedTailorId] = useState<string | null>(null);

  // Sync initial state when task changes or workflow data arrives
  useState(() => {
    if (task) {
      setSelectedStageId(task.stageId);
      setSelectedTailorId(task.assignedTailorId || null);
    }
  });

  // Re-sync when task or workflow data changes
  useMemo(() => {
    if (task) {
      setSelectedStageId(task.stageId);
      setSelectedTailorId(task.assignedTailorId || null);
    }
  }, [task]);

  if (!task) return null;

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
        className: 'sf-glass',
        sx: { borderRadius: 4, backgroundImage: 'none', bgcolor: 'rgba(255, 255, 255, 0.9)' },
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
            <FormControl fullWidth size="small">
              <Select
                value={selectedTailorId || ''}
                onChange={(e) => setSelectedTailorId(e.target.value || null)}
                disabled={isStaffLoading}
                sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
                displayEmpty
              >
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
              </Select>
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

// ─── Main Page ─────────────────────────────────────────────────

export function ProductionBoardPage() {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading, isError } = useActiveTasks();
  const [selectedTask, setSelectedTask] = useState<ActiveFloorTask | null>(null);
  const [quickUpdateTask, setQuickUpdateTask] = useState<ActiveFloorTask | null>(null);
  
  // Local Filtering & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
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
    const completed = 12; // Placeholder

    return [
      { title: 'Total Active Orders', value: active, color: '#1a237e', icon: <QueryStatsIcon fontSize="large" /> },
      { title: 'Due Today', value: dueToday, color: '#d32f2f', icon: <ScheduleIcon fontSize="large" /> },
      { title: 'Fittings Scheduled', value: fittings, color: '#fbc02d', icon: <EventIcon fontSize="large" /> },
      { title: 'Completed this Week', value: completed, color: '#388e3c', icon: <CheckCircleIcon fontSize="large" /> },
    ];
  }, [tasks]);

  // Derive Tailors for Filter
  const uniqueTailors = useMemo(() => {
    const tailors = Array.from(new Set(tasks.map(t => t.assignedTailorId).filter(Boolean))) as string[];
    return tailors;
  }, [tasks]);

  // Handle Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const orderId = task.orderId || '';
      const customerName = task.customerName || '';
      const searchStr = search.toLowerCase();
      
      const matchesSearch = 
        orderId.toLowerCase().includes(searchStr) || 
        customerName.toLowerCase().includes(searchStr);
      const matchesStatus = statusFilter === 'All' || task.stageName === statusFilter;
      const matchesTailor = tailorFilter === 'All' || task.assignedTailorId === tailorFilter;
      return matchesSearch && matchesStatus && matchesTailor;
    });
  }, [tasks, search, statusFilter, tailorFilter]);

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
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={100} sx={{ mb: 4, borderRadius: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Failed to load Production Ledger. Please retry.</Alert>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, mx: 'auto' }}>
      
      {/* 1. Page Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            Production Ledger
          </Typography>
          <Typography variant="body2" color="text.secondary">
            High-density operational control center
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search Order ID/Client..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: 200, md: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <IconButton sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <NotificationsNoneIcon />
          </IconButton>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 700 }}>
            AD
          </Avatar>
        </Stack>
      </Stack>

      {/* 2. KPI Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <KPICard title={kpi.title} value={kpi.value} accentColor={kpi.color} icon={kpi.icon} />
          </Grid>
        ))}
      </Grid>

      {/* 3. Filter Bar */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        alignItems="center" 
        className="sf-glass"
        sx={{ 
          mb: 3, 
          p: 2, 
          borderRadius: 3, 
          border: '1px solid', 
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mr: 1 }}>Filters:</Typography>
        <Select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150, borderRadius: 3 }}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value="Cutting">Cutting</MenuItem>
          <MenuItem value="Sewing">Sewing</MenuItem>
          <MenuItem value="Fitting">Fitting</MenuItem>
          <MenuItem value="Finishing">Finishing</MenuItem>
        </Select>
        
        <Select 
          value={tailorFilter} 
          onChange={(e) => setTailorFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150, borderRadius: 3 }}
        >
          <MenuItem value="All">All Tailors</MenuItem>
          {uniqueTailors.map((id: string) => (
            <MenuItem key={id} value={id}>Tailor #{id.slice(0, 4)}</MenuItem>
          ))}
        </Select>

        <Select value="Month" size="small" sx={{ minWidth: 150, borderRadius: 3 }}>
          <MenuItem value="Month">Last 30 Days</MenuItem>
          <MenuItem value="Week">Last 7 Days</MenuItem>
        </Select>

        <Box sx={{ ml: 'auto !important' }}>
          <Button 
            variant="contained" 
            startIcon={<FileDownloadIcon />}
            sx={{ 
              bgcolor: '#fbc02d', 
              color: '#000', 
              '&:hover': { bgcolor: '#f9a825' }, 
              fontWeight: 700,
              borderRadius: 3,
              px: 3
            }}
          >
            Export Ledger
          </Button>
        </Box>
      </Stack>

      {/* 4. Production Data Table */}
      <TableContainer 
        component={Paper} 
        elevation={0} 
        sx={{ 
          border: '1px solid', 
          borderColor: 'divider', 
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <Table size="medium">
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Client Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Garment Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Fabric</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tailor</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTasks.map((task) => {
              const statusStyle = getStatusStyles(task.stageName);
              const atRisk = isAtRisk(task.deadline);
              
              return (
                <TableRow key={task.stageInstanceId}>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <Link 
                      to={`/orders/${task.orderId}`} 
                      style={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        borderBottom: '1px dashed',
                        borderColor: 'rgba(0,0,0,0.2)'
                      }}
                    >
                      {task.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{task.customerName}</TableCell>
                  <TableCell>{task.garmentName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={task.stageName} 
                      size="small" 
                      sx={{ 
                        fontWeight: 700, 
                        color: statusStyle.color, 
                        bgcolor: statusStyle.bgColor,
                        borderRadius: 2
                      }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar 
                        src={task.fabric_image_base64} 
                        alt={task.garmentName}
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '0.8rem',
                          bgcolor: task.garmentName ? stringToColor(task.garmentName) : 'grey.300',
                          borderRadius: 2
                        }}
                      >
                        {task.garmentName?.charAt(0) || '?'}
                      </Avatar>
                      <Typography variant="body2">{task.fabricName || '--'}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{formatTableDate(task.startDate)}</TableCell>
                  <TableCell sx={{ color: atRisk ? 'error.main' : 'text.primary', fontWeight: atRisk ? 700 : 400 }}>
                    {formatTableDate(task.deadline)}
                  </TableCell>
                  <TableCell>
                    {task.tailorEmail ? (
                      <Chip 
                        label={task.tailorEmail.split('@')[0]} 
                        size="small" 
                        variant="outlined" 
                        sx={{ 
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }} 
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">Unassigned</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="View Order Command Center">
                        <IconButton size="small" onClick={() => navigate(`/orders/${task.orderId}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Quick Update (Status & Tailor)">
                        <IconButton size="small" onClick={() => setQuickUpdateTask(task)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share Link">
                        <IconButton size="small">
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredTasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
      </TableContainer>

      {/* Execution Dialog */}
      <ExecutionDialog
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      {/* Quick Update Modal */}
      <QuickUpdateModal
        task={quickUpdateTask}
        onClose={() => setQuickUpdateTask(null)}
      />
    </Box>
  );
}
