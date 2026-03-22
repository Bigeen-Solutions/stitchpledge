import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import FactoryIcon from '@mui/icons-material/Factory';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useActiveTasks, useMarkStageComplete } from '../features/workflow/hooks/useProductionBoard';
import type { ActiveFloorTask } from '../features/workflow/workflow.api';
import { WorkflowGraph } from '../features/workflow/components/WorkflowGraph';

// ─── Risk chip helpers ──────────────────────────────────────────
const RISK_CHIP_CONFIG = {
  ON_TRACK: { label: 'On Track', color: 'success' as const },
  AT_RISK: { label: 'At Risk', color: 'warning' as const },
  OVERDUE: { label: 'Overdue', color: 'error' as const },
};

function getRiskConfig(riskLevel: string) {
  return RISK_CHIP_CONFIG[riskLevel as keyof typeof RISK_CHIP_CONFIG] ?? RISK_CHIP_CONFIG.ON_TRACK;
}

function formatDeadline(deadline: string): string {
  try {
    return new Date(deadline).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return deadline;
  }
}

// ─── Skeleton loader for board columns ─────────────────────────
function KanbanSkeleton() {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3].map((col) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={col}>
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2, border: '1px solid', borderColor: 'divider' }}>
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
            {[1, 2].map((card) => (
              <Skeleton key={card} variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 1.5 }} />
            ))}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

// ─── Task Card ─────────────────────────────────────────────────
interface TaskCardProps {
  task: ActiveFloorTask;
  onOpen: (task: ActiveFloorTask) => void;
}

function TaskCard({ task, onOpen }: TaskCardProps) {
  const risk = getRiskConfig(task.riskLevel);

  return (
    <Card
      elevation={0}
      sx={{
        mb: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardActionArea onClick={() => onOpen(task)} sx={{ p: 0 }}>
        <CardContent>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ mb: 0.5, lineHeight: 1.3 }}
          >
            {task.garmentName}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {task.customerName}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Chip
              label={risk.label}
              color={risk.color}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
            />
            <Typography variant="caption" color="text.secondary">
              {formatDeadline(task.deadline)}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

// ─── Kanban Column ─────────────────────────────────────────────
interface KanbanColumnProps {
  stageName: string;
  tasks: ActiveFloorTask[];
  onOpen: (task: ActiveFloorTask) => void;
}

function KanbanColumn({ stageName, tasks, onOpen }: KanbanColumnProps) {
  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
        minHeight: 200,
      }}
    >
      {/* Column Header */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="overline" fontWeight={700} color="text.secondary">
          {stageName}
        </Typography>
        <Chip
          label={tasks.length}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.7rem',
            fontWeight: 700,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        />
      </Stack>

      {/* Task Cards */}
      {tasks.map((task) => (
        <TaskCard key={task.stageInstanceId} task={task} onOpen={onOpen} />
      ))}
    </Box>
  );
}

// ─── Execution Modal ────────────────────────────────────────────
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
        sx: {
          borderRadius: 3,
          backgroundImage: 'none',
        },
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
          <Box sx={{ ml: 'auto !important' }}>
            {(() => {
              const risk = getRiskConfig(task.riskLevel);
              return (
                <Chip
                  label={risk.label}
                  color={risk.color}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              );
            })()}
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* Reuse the existing WorkflowGraph DAG visualization from Phase 3 */}
        <WorkflowGraph garmentId={task.garmentId} orderId={task.orderId} />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={markComplete.isPending}>
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleComplete}
          disabled={markComplete.isPending}
          startIcon={
            markComplete.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <CheckCircleOutlineIcon />
            )
          }
          sx={{ minWidth: 160 }}
        >
          {markComplete.isPending ? 'Syncing...' : 'Mark Complete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export function ProductionBoardPage() {
  const { data: tasks, isLoading, isError } = useActiveTasks();
  const [selectedTask, setSelectedTask] = useState<ActiveFloorTask | null>(null);

  // Group tasks by stage name to form Kanban columns
  const columns = useMemo(() => {
    if (!tasks) return [];
    const map = new Map<string, { stageName: string; stageId: string; tasks: ActiveFloorTask[] }>();
    for (const task of tasks) {
      if (!map.has(task.stageId)) {
        map.set(task.stageId, { stageName: task.stageName, stageId: task.stageId, tasks: [] });
      }
      map.get(task.stageId)!.tasks.push(task);
    }
    return Array.from(map.values());
  }, [tasks]);

  return (
    <Box>
      {/* Page Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <FactoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2 }}>
            Production Floor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live view of all active work across all stations
          </Typography>
        </Box>
        {tasks && (
          <Chip
            label={`${tasks.length} active task${tasks.length !== 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
            sx={{ ml: 'auto !important', fontWeight: 600 }}
          />
        )}
      </Stack>

      {/* Loading State */}
      {isLoading && <KanbanSkeleton />}

      {/* Error State */}
      {isError && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load production tasks. Please refresh to try again.
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !isError && tasks && tasks.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 2, py: 3 }}>
          <Typography fontWeight={600}>No active tasks on the floor right now.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            When garments reach an active stage, they will appear here as Kanban cards.
          </Typography>
        </Alert>
      )}

      {/* Kanban Board */}
      {!isLoading && !isError && columns.length > 0 && (
        <Grid container spacing={3}>
          {columns.map((col) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={col.stageId}>
              <KanbanColumn
                stageName={col.stageName}
                tasks={col.tasks}
                onOpen={(task) => setSelectedTask(task)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Execution Modal */}
      <ExecutionDialog
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </Box>
  );
}
