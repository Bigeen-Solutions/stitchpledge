import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetail, useOrderGarments } from '../features/orders/hooks/useOrderDetail.ts';
import { useStaffList } from '../features/auth/hooks/useStaff.ts';
import { usePermissions } from '../features/auth/use-permissions.ts';
import { ordersApi } from '../features/orders/orders.api.ts';
import { useToastStore } from '../components/feedback/Toast.tsx';
import { WorkflowGraph } from '../features/workflow/components/WorkflowGraph.tsx';
import { MaterialHistory } from '../features/materials/components/MaterialHistory.tsx';
import { MaterialAdjustmentForm } from '../features/materials/components/MaterialAdjustmentForm.tsx';
import { MeasurementHistory } from '../features/measurements/components/MeasurementHistory.tsx';
import { RecordMeasurementForm } from '../features/measurements/components/RecordMeasurementForm.tsx';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  Typography,
  Button,
  Avatar,
  Stack,
  Box,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const { isCompanyAdminOrManager } = usePermissions();
  const { data: detail, isLoading, isError } = useOrderDetail(id!);
  const { data: garments, isLoading: isLoadingGarments, refetch: refetchGarments } = useOrderGarments(id!);
  const { data: staff } = useStaffList({ 
    storeId: detail?.order.storeId,
    enabled: isCompanyAdminOrManager && !!detail?.order.storeId
  });
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);

  const tailors = staff?.filter(s => s.role === 'TAILOR') || [];

  useEffect(() => {
    if (garments && garments.length > 0 && !selectedGarmentId) {
      setSelectedGarmentId(garments[0].id);
    }
  }, [garments, selectedGarmentId]);

  if (isLoading || isLoadingGarments) return <div className="sf-loading-overlay sf-glass">Syncing Production Context...</div>;
  if (isError || !detail) return <div className="container p-lg text-center"><h1>Order Not Found</h1><p>This production record does not exist or access is restricted.</p></div>;

  const { order, projection } = detail;
  const selectedGarment = garments?.find(g => g.id === selectedGarmentId);

  const handleAssignTailor = async (tailorId: string) => {
    if (!selectedGarmentId) return;
    try {
      await ordersApi.assignTailor(selectedGarmentId, tailorId || null);
      showToast("Assignment updated successfully", "success");
      refetchGarments();
    } catch (err) {
      showToast("Failed to update assignment", "error");
    }
  };

  const riskBadgeClass =
    projection.riskLevel === 'ON_TRACK' ? 'badge-ontrack' :
    projection.riskLevel === 'AT_RISK' ? 'badge-atrisk' : 'badge-overdue';

  return (
    <Box className="order-detail-page" sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* 1. Global Header */}
      <Card elevation={0} className="sf-glass" sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={3} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/orders')}
              sx={{ borderRadius: 3, px: 2, fontWeight: 700 }}
            >
              Back to Ledger
            </Button>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
                Production Record
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                #{order.orderNumber}
              </Typography>
            </Box>
            <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', pl: 3 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
                Event Date
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {new Date(order.eventDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>
          <Stack alignItems="flex-end" spacing={1}>
            <div className={`badge ${riskBadgeClass} py-2 px-4 text-sm font-bold shadow-sm`} style={{ borderRadius: '8px' }}>
              {projection.riskLevel.replace('_', ' ')}
            </div>
            <Typography variant="caption" color="text.secondary">
              Last projection: {new Date(projection.calculatedAt).toLocaleTimeString()}
            </Typography>
          </Stack>
        </Stack>
      </Card>

      <Grid container spacing={4}>
        {/* 2. Left Sidebar (4 Columns) */}
        <Grid size={{xs: 12, md: 4}}>
          <Stack spacing={3}>
            {/* Component A: Client Perimeter */}
            <Card className="sf-card" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Client Perimeter</Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Customer Name</Typography>
                  <Typography variant="body1" fontWeight={700}>{order.customerName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Wedding/Event Date</Typography>
                  <Typography variant="body1" fontWeight={700}>{new Date(order.eventDate).toLocaleDateString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Volume</Typography>
                  <Typography variant="body1" fontWeight={700}>Total Garments: {garments?.length || 0}</Typography>
                </Box>
              </Stack>
            </Card>

            {/* Component B: Garment Selector */}
            <Card className="sf-card" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Garment Inventory</Typography>
              <Stack spacing={1} sx={{ mb: 3 }}>
                {garments?.map((garment) => (
                  <Button
                    key={garment.id}
                    fullWidth
                    onClick={() => setSelectedGarmentId(garment.id)}
                    sx={{
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: selectedGarmentId === garment.id ? 'primary.main' : 'divider',
                      bgcolor: selectedGarmentId === garment.id ? 'rgba(30, 92, 58, 0.05)' : 'transparent',
                      color: 'text.primary',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      '&:hover': {
                        bgcolor: 'rgba(30, 92, 58, 0.08)',
                        borderColor: 'primary.main'
                      },
                      borderLeft: selectedGarmentId === garment.id ? '6px solid' : '1px solid',
                      borderLeftColor: selectedGarmentId === garment.id ? 'primary.main' : 'divider'
                    }}
                  >
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" sx={{ fontWeight: selectedGarmentId === garment.id ? 800 : 500 }}>
                        {garment.name}
                      </Typography>
                      {garment.assignedTailorId && (
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block', mt: 0.5 }}>
                          Tailor: {staff?.find(s => s.id === garment.assignedTailorId)?.email.split('@')[0] || 'Assigned'}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
                      {garment.status}
                    </Typography>
                  </Button>
                ))}
              </Stack>

              {selectedGarment && isCompanyAdminOrManager && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
                    Production Assignment
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel id="assign-tailor-label">Assign Tailor</InputLabel>
                    <Select
                      labelId="assign-tailor-label"
                      value={selectedGarment.assignedTailorId || ''}
                      label="Assign Tailor"
                      onChange={(e) => handleAssignTailor(e.target.value as string)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value=""><em>Unassigned</em></MenuItem>
                      {tailors.map(t => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.email}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Card>

            {/* Component C: Quick Actions */}
            <Card className="sf-card" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Quick Actions</Typography>
              <Stack spacing={2}>
                <RecordMeasurementForm orderId={order.id} />
                <MaterialAdjustmentForm orderId={order.id} />
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* 3. Main Content Area (8 Columns) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Component A: Garment Evidence */}
            <Card className="sf-card" sx={{ p: 4, borderRadius: 3 }}>
              {selectedGarment ? (
                <Stack spacing={4}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h5" fontWeight={800}>{selectedGarment.name}</Typography>
                      <Chip
                        label={selectedGarment.status}
                        size="small"
                        sx={{ mt: 1, fontWeight: 700, borderRadius: 1.5, textTransform: 'uppercase' }}
                      />
                    </Box>
                  </Stack>

                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                        Fabric Reference
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          variant="rounded"
                          src={selectedGarment.fabricImageBase64 || undefined}
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            bgcolor: 'primary.light',
                            border: '1px solid',
                            borderColor: 'divider',
                            '& img': { objectFit: 'cover' }
                          }}
                          className="sf-glass"
                        >
                          {selectedGarment.fabricType?.charAt(0) || 'F'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {selectedGarment.fabricType || 'Standard Fabric'}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: selectedGarment.colorSwatch || '#eee',
                                border: '1px solid rgba(0,0,0,0.1)'
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {selectedGarment.colorSwatch || 'No Swatch'}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 8 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                        Design Notes
                      </Typography>
                      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2, minHeight: 80 }} className="sf-glass">
                        <Typography variant="body2" sx={{ fontStyle: selectedGarment.designNotes ? 'normal' : 'italic', color: selectedGarment.designNotes ? 'text.primary' : 'text.secondary' }}>
                          {selectedGarment.designNotes || 'No custom design notes provided for this garment.'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Measurements Grid - Dense Key/Value format as requested */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', mb: 2, display: 'block' }}>
                      Precision Measurements
                    </Typography>
                    {(() => {
                      const orderMeasurements = order.measurements || {};
                      const requiredKeys = selectedGarment.requiredMeasurements || [];
                      const filteredMeasurements = Object.entries(orderMeasurements).filter(([key]) => 
                        requiredKeys.length === 0 || requiredKeys.includes(key)
                      );

                      if (filteredMeasurements.length > 0) {
                        return (
                          <Grid container spacing={2}>
                            {filteredMeasurements.map(([key, value]) => (
                              <Grid size={{ xs: 4, sm: 3 }} key={key}>
                                <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      fontSize: '0.65rem',
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      display: 'block',
                                      mb: 0.5
                                    }}
                                  >
                                    {key.replace(/_/g, ' ')}
                                  </Typography>
                                  <Typography variant="body1" color="primary" sx={{ fontWeight: 800 }}>
                                    {String(value)}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        );
                      }

                      return (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
                          No measurements recorded for this garment type.
                        </Typography>
                      );
                    })()}
                  </Box>
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">Select a garment to view evidence</Typography>
                </Box>
              )}
            </Card>

            {/* Component B: Production Workflow */}
            <Card className="sf-card" sx={{ p: 0, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.01)', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={800}>Production Workflow</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {selectedGarmentId ? (
                  <WorkflowGraph garmentId={selectedGarmentId} orderId={order.id} />
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Select a garment to view production graph</Typography>
                  </Box>
                )}
              </Box>
            </Card>

            {/* Component C: History Logs */}
            <Grid container spacing={3}>
              <Grid size = {{xs: 12, sm: 6}}>
                <Card className="sf-card" sx={{ height: '100%', borderRadius: 3, p: 3 }}>
                   <MaterialHistory orderId={order.id} />
                </Card>
              </Grid>
              <Grid size = {{xs: 12, sm: 6}}>
                <Card className="sf-card" sx={{ height: '100%', borderRadius: 3, p: 3 }}>
                  <MeasurementHistory orderId={order.id} />
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
