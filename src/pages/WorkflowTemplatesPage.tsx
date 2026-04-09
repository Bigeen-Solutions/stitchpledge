import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  Button, 
  Stack, 
  alpha,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  AccountTree as WorkflowIcon,
  Add as AddIcon,
  Timer as TimerIcon,
  ArrowForward as ArrowIcon,
  Category as GarmentIcon
} from '@mui/icons-material';
import { useWorkflowTemplates, useTemplateStages, useAddTemplateStage } from '../features/workflow/hooks/useWorkflowTemplates';

export function WorkflowTemplatesPage() {
  const { data: templates, isLoading: isLoadingTemplates } = useWorkflowTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const { data: stages, isLoading: isLoadingStages } = useTemplateStages(selectedTemplateId || undefined);
  const addStageMutation = useAddTemplateStage();

  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [newStage, setNewStage] = useState({ name: '', duration: '8' });

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  const handleAddStage = async () => {
    if (!selectedTemplateId || !newStage.name) return;
    await addStageMutation.mutateAsync({
      templateId: selectedTemplateId,
      name: newStage.name,
      duration: parseFloat(newStage.duration)
    });
    setIsAddStageOpen(false);
    setNewStage({ name: '', duration: '8' });
  };

  return (
    <Box className="container">
      <header style={{ marginBottom: 40 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <WorkflowIcon color="secondary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Workflow Blueprint Builder</Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Define the sequence of production stages and estimated durations for each garment type.
        </Typography>
      </header>

      <Grid container spacing={4}>
        {/* TEMPLATE LIST */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Garment Templates</Typography>
          <Stack spacing={2}>
            {isLoadingTemplates ? (
              <Typography>Loading templates...</Typography>
            ) : (
              templates?.map((template) => (
                <Card 
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer',
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: selectedTemplateId === template.id ? 'primary.main' : 'transparent',
                    bgcolor: selectedTemplateId === template.id ? alpha('#1e5c3a', 0.05) : 'background.paper',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      borderColor: selectedTemplateId === template.id ? 'primary.main' : alpha('#1e5c3a', 0.3)
                    }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <GarmentIcon color={selectedTemplateId === template.id ? 'primary' : 'disabled'} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{template.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        ID: {template.id.split('-')[0]}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              ))
            )}
          </Stack>
        </Grid>

        {/* STAGE BUILDER / DETAIL */}
        <Grid size={{ xs: 12, md: 8 }}>
          {selectedTemplateId ? (
            <Card sx={{ 
              p: 4, 
              borderRadius: '24px', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{selectedTemplate?.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Sequence of Production Stages</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddStageOpen(true)}
                  sx={{ borderRadius: '12px', fontWeight: 700 }}
                >
                  Add Stage
                </Button>
              </Stack>

              <Divider sx={{ mb: 4 }} />

              {isLoadingStages ? (
                <Typography>Loading stages...</Typography>
              ) : stages && stages.length > 0 ? (
                <List sx={{ position: 'relative' }}>
                  {stages.map((stage, index) => (
                    <Box key={stage.id}>
                      <ListItem sx={{ 
                        p: 3, 
                        bgcolor: 'background.default', 
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: index < stages.length - 1 ? 4 : 0,
                        position: 'relative',
                        '&:hover': {
                          borderColor: 'primary.light'
                        }
                      }}>
                        <ListItemIcon>
                          <Box sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.875rem'
                          }}>
                            {index + 1}
                          </Box>
                        </ListItemIcon>
                        <ListItemText 
                          primary={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{stage.name}</Typography>}
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                              <TimerIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption">Est. Duration: {stage.estimated_duration_hours || 0} hours</Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                      {index < stages.length - 1 && (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          my: -2, 
                          position: 'relative', 
                          zIndex: 1,
                          color: 'primary.light' 
                        }}>
                          <ArrowIcon sx={{ transform: 'rotate(90deg)', fontSize: 32 }} />
                        </Box>
                      )}
                    </Box>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                    No stages defined for this template yet.
                  </Typography>
                </Box>
              )}
            </Card>
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: '24px',
              p: 8,
              textAlign: 'center'
            }}>
              <Box>
                <WorkflowIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  Select a template to view or build its workflow sequence.
                </Typography>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* ADD STAGE DIALOG */}
      <Dialog 
        open={isAddStageOpen} 
        onClose={() => setIsAddStageOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Add Stage to Sequence</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            <Stack spacing={3}>
              <TextField
                label="Stage Name"
                fullWidth
                value={newStage.name}
                onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                autoFocus
                placeholder="e.g. Cutting, Hand Stitching"
              />
              <TextField
                label="Estimated Duration (Hours)"
                type="number"
                fullWidth
                value={newStage.duration}
                onChange={(e) => setNewStage({ ...newStage, duration: e.target.value })}
                placeholder="8"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsAddStageOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddStage}
            disabled={!newStage.name || addStageMutation.isPending}
            sx={{ borderRadius: '12px', fontWeight: 700, px: 3 }}
          >
            {addStageMutation.isPending ? 'Adding...' : 'Add Stage'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
