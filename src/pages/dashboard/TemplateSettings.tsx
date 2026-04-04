import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  TextField,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha
} from "@mui/material";
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Straighten as MeasurementsIcon
} from "@mui/icons-material";
import { useWorkflowTemplates } from "../../features/workflow/hooks/useWorkflowTemplates";
import { workflowApi } from "../../features/workflow/workflow.api";
import { useToastStore } from "../../components/feedback/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { keys } from "../../query/keys";

export default function TemplateSettings() {
  const queryClient = useQueryClient();
  const { data: templates } = useWorkflowTemplates();
  const showToast = useToastStore((state) => state.showToast);

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState("");
  const [currentMeasurements, setCurrentMeasurements] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // New Template State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleOpenEditor = (template: any) => {
    setSelectedTemplate(template);
    setCurrentMeasurements(template.requiredMeasurements || []);
    setIsModalOpen(true);
  };

  const handleAddMeasurement = () => {
    if (!newMeasurement.trim()) return;
    if (currentMeasurements.includes(newMeasurement.trim())) {
      showToast("Measurement already exists", "warning");
      return;
    }
    setCurrentMeasurements([...currentMeasurements, newMeasurement.trim()]);
    setNewMeasurement("");
  };

  const handleDeleteMeasurement = (toDelete: string) => {
    setCurrentMeasurements(currentMeasurements.filter(m => m !== toDelete));
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    try {
      await workflowApi.updateTemplateMeasurements(selectedTemplate.id, currentMeasurements);
      showToast("Sync Successful", "Template measurements updated across the forge.", "success");
      
      // Fix: Explicitly invalidate cache so all components see the update
      await queryClient.invalidateQueries({ queryKey: keys.workflow.templates });
      
      setIsModalOpen(false);
    } catch (err: any) {
      showToast("Update Failed", err.message || "Failed to update measurements", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;
    setIsCreating(true);
    try {
      await workflowApi.createTemplate(newTemplateName.trim());
      showToast("Template Minted", `${newTemplateName} is now available in the forge.`, "success");
      
      // Invalidate cache to show new template
      await queryClient.invalidateQueries({ queryKey: keys.workflow.templates });
      
      setIsCreateModalOpen(false);
      setNewTemplateName("");
    } catch (err: any) {
      showToast("Creation Failed", err.message || "Failed to create template", "error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
            Garment Forge
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Define the blueprint and required measurements for your bespoke production.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateModalOpen(true)}
          sx={{
            borderRadius: '12px',
            px: 3,
            py: 1.5,
            bgcolor: 'primary.main',
            fontWeight: 700,
            boxShadow: '0 4px 14px 0 rgba(30, 92, 58, 0.39)',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(30, 92, 58, 0.23)'
            }
          }}
        >
          Create New Garment Template
        </Button>
      </header>

      <Grid container spacing={3}>
        {templates?.map((template) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={template.id}>
            <Card sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'secondary.main',
                boxShadow: `0 10px 30px ${alpha('#c49a1a', 0.1)}`,
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{template.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {template.requiredMeasurements?.length || 0} fields defined
                  </Typography>
                </Box>
                <IconButton onClick={() => handleOpenEditor(template)} sx={{ color: 'primary.main', bgcolor: alpha('#1e5c3a', 0.05) }}>
                  <SettingsIcon />
                </IconButton>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                {template.requiredMeasurements?.slice(0, 4).map((m: string) => (
                  <Chip key={m} label={m} size="small" variant="outlined" sx={{ borderRadius: '6px' }} />
                ))}
                {(template.requiredMeasurements?.length || 0) > 4 && (
                  <Chip label={`+${template.requiredMeasurements.length - 4}`} size="small" sx={{ borderRadius: '6px' }} />
                )}
                {(!template.requiredMeasurements || template.requiredMeasurements.length === 0) && (
                  <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                    No measurements defined
                  </Typography>
                )}
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* MEASUREMENT EDITOR MODAL */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <MeasurementsIcon color="secondary" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Forge: {selectedTemplate?.name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>REQUIRED MEASUREMENTS</Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setIsModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderBottom: 'none' }}>
          <Box sx={{ py: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Design the measurement sequence</Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="New measurement name (e.g. Hip, Thigh)..."
                value={newMeasurement}
                onChange={(e) => setNewMeasurement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMeasurement()}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'background.default' }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddMeasurement}
                sx={{ borderRadius: '12px', px: 3, bgcolor: 'primary.main' }}
              >
                Add
              </Button>
            </Stack>

            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 2, display: 'block' }}>
              Active Specification list
            </Typography>
            <Box sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              minHeight: 120
            }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                {currentMeasurements.map((m) => (
                  <Chip
                    key={m}
                    label={m}
                    onDelete={() => handleDeleteMeasurement(m)}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 600,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      '& .MuiChip-deleteIcon': { color: 'error.light' }
                    }}
                  />
                ))}
                {currentMeasurements.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', width: '100%', py: 4 }}>
                    Define at least one measurement to enable intake for this garment.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Button onClick={() => setIsModalOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button
            variant="contained"
            size="large"
            startIcon={isSaving ? null : <SaveIcon />}
            disabled={isSaving}
            onClick={handleSave}
            sx={{
              borderRadius: '12px',
              px: 4,
              bgcolor: 'secondary.main',
              fontWeight: 700,
              '&:hover': { bgcolor: '#d4aa2a' }
            }}
          >
            {isSaving ? "Syncing..." : "Save Manifest"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREATE TEMPLATE DIALOG */}
      <Dialog
        open={isCreateModalOpen}
        onClose={() => !isCreating && setIsCreateModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Mint New Template</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Enter a unique name for this garment template. It will be initialized with a standard production workflow.
            </Typography>
            <TextField
              fullWidth
              autoFocus
              label="Template Name"
              placeholder="e.g. Winter Coat, Tuxedo"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTemplate()}
              disabled={isCreating}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsCreateModalOpen(false)} disabled={isCreating} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTemplate}
            disabled={isCreating || !newTemplateName.trim()}
            sx={{
              borderRadius: '12px',
              px: 4,
              bgcolor: 'primary.main',
              fontWeight: 700
            }}
          >
            {isCreating ? "Minting..." : "Mint Template"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
