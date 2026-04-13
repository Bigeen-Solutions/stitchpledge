import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Straighten as MeasurementsIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingBag as OrderIcon
} from '@mui/icons-material';
import { useCustomerProfile, useUpdateMeasurements } from '../features/customers/hooks/useCustomerProfile';
import { ErrorState } from '../components/feedback/ErrorState';
import { useToastStore } from '../components/feedback/Toast';
import { truncateId, safeFormatDistanceToNow, safeLocaleDate } from '../utils/format';
import { OrderEntryItem } from '../features/orders/components/OrderEntryItem';
import { Timeline, TimelineItem } from '../components/timeline/Timeline';

const DEFAULT_MEASUREMENT_KEYS = [
  'Neck', 'Chest', 'Waist', 'Hips', 'Shoulder', 'Sleeve', 'Inseam', 'Outseam'
];

export function ClientProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const showToast = useToastStore((state) => state.showToast);
  const { data: profile, isLoading, isError, error, refetch } = useCustomerProfile(id!);
  const updateMutation = useUpdateMeasurements(id!);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, number>>({});

  // Initialize form values when modal opens or profile changes
  useEffect(() => {
    if (profile?.latestMeasurement) {
      setFormValues(profile.latestMeasurement.measurements);
    } else {
      // Default empty values for common fields
      const defaults: Record<string, number> = {};
      DEFAULT_MEASUREMENT_KEYS.forEach(key => defaults[key] = 0);
      setFormValues(defaults);
    }
  }, [profile, isModalOpen]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (isError || !profile) {
    return (
      <Box className="container mt-xl">
        <ErrorState 
          error={error} 
          onRetry={() => refetch()} 
          title="Failed to load client profile"
        />
      </Box>
    );
  }

  const { customer, latestMeasurement, orderHistory } = profile;

  const handleUpdateSubmit = async () => {
    try {
      await updateMutation.mutateAsync(formValues);
      showToast("Measurement Recorded", "A new immutable version has been saved to the ledger.", "success");
      setIsModalOpen(false);
    } catch (err: any) {
      showToast("Record Failed", err.message || "Could not save measurements.", "error");
    }
  };

  return (
    <Box className="container" sx={{ pt: 4, pb: 8 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Button 
          component={Link} 
          to="/customers" 
          startIcon={<ArrowBackIcon />}
          sx={{ color: 'text.secondary', textTransform: 'none' }}
        >
          Back to Clients
        </Button>
      </Stack>

      <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
            {customer.name}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EmailIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">{customer.email || 'No email'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhoneIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">{customer.phone || 'No phone'}</Typography>
            </Box>
          </Stack>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<OrderIcon />}
            onClick={() => navigate(`/orders/new?customerId=${customer.id}`)}
            sx={{ borderRadius: '12px', px: 3, py: 1.5, fontWeight: 700 }}
          >
            Create New Order
          </Button>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<EditIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{ borderRadius: '12px', px: 3, py: 1.5, fontWeight: 700 }}
          >
            Record New Measurement
          </Button>
        </Stack>
      </header>

      <Grid container spacing={4}>
        {/* LEFT PANEL: Info Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="sf-card" sx={{ p: 4, height: '100%', borderRadius: '24px' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="secondary" /> Client Context
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Secure System Identifier</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: alpha('#1e5c3a', 0.05), p: 1, borderRadius: '8px', mt: 0.5, color: 'primary.dark', fontWeight: 700 }}>
                  {truncateId(customer.id).toUpperCase()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Account Created</Typography>
                <Typography variant="body1">{new Date(customer.createdAt).toLocaleDateString()}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Measurement Status</Typography>
                <Box sx={{ mt: 1 }}>
                  {latestMeasurement ? (
                    <Box component="span" sx={{ px: 1.5, py: 0.5, bgcolor: alpha('#1e5c3a', 0.1), color: 'primary.main', borderRadius: 'pill', fontSize: '0.75rem', fontWeight: 700 }}>
                      VERSION {latestMeasurement.versionNumber} ACTIVE
                    </Box>
                  ) : (
                    <Box component="span" sx={{ px: 1.5, py: 0.5, bgcolor: alpha('#7f1d1d', 0.1), color: '#d32f2f', borderRadius: 'pill', fontSize: '0.75rem', fontWeight: 700 }}>
                      NO MEASUREMENTS ON FILE
                    </Box>
                  )}
                </Box>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* CENTER PANEL: Measurements Grid */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="sf-glass" sx={{ p: 4, borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}>
              <MeasurementsIcon sx={{ fontSize: 150 }} />
            </Box>
            
            <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MeasurementsIcon color="secondary" /> Master Measurements
            </Typography>

            {!latestMeasurement ? (
              <Box sx={{ py: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '16px' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>No measurement profile found for this client.</Typography>
                <Button variant="outlined" color="primary" onClick={() => setIsModalOpen(true)}>Initialize Profile</Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {Object.entries(latestMeasurement.measurements).map(([key, value]) => (
                  <Grid size={{ xs: 6, sm: 4, lg: 3 }} key={key}>
                    <Box sx={{ p: 2, bgcolor: alpha('#fff', 0.5), borderRadius: '12px', border: '1px solid', borderColor: alpha('#000', 0.05) }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>{key}</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{value}<small style={{ fontSize: '0.6em', opacity: 0.5, marginLeft: 2 }}>cm</small></Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {latestMeasurement && (
              <Typography variant="caption" sx={{ display: 'block', mt: 4, textAlign: 'right', color: 'text.secondary' }}>
                Last updated: {safeLocaleDate(latestMeasurement.createdAt)}
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="sf-card" sx={{ p: 4, borderRadius: '24px', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon color="secondary" /> Order History Projection
            </Typography>

            {orderHistory.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                No past orders found for this client.
              </Box>
            ) : (
              <Stack spacing={0}>
                {orderHistory.map((order) => (
                  <OrderEntryItem 
                    key={order.id} 
                    order={{
                      ...order,
                      customerName: customer.name,
                      garmentName: "Archived Production",
                      eventDate: "" // Not always available in summary
                    }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  />
                ))}
              </Stack>
            )}
          </Card>
        </Grid>

        {/* RIGHT PANEL: Measurement History Timeline */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="sf-card" sx={{ p: 4, borderRadius: '24px', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MeasurementsIcon color="secondary" /> Measurement Lifecycle
            </Typography>

            <Timeline>
              {(profile.measurementVersions || []).map((v) => (
                <TimelineItem
                  key={v.id}
                  actor="System Recorder"
                  timestamp={safeFormatDistanceToNow(v.createdAt)}
                  action={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Version {v.versionNumber} Committed
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {Object.keys(v.measurements).length} precision points recorded
                      </Typography>
                    </Box>
                  }
                />
              ))}
              {(!profile.measurementVersions || profile.measurementVersions.length === 0) && (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                  No historical versions available.
                </Typography>
              )}
            </Timeline>
          </Card>
        </Grid>
      </Grid>

      {/* UPDATE MEASUREMENTS MODAL */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', p: 2 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {latestMeasurement ? `Record New Measurement Version (v${latestMeasurement.versionNumber + 1})` : 'Initialize Measurements'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Historical integrity is enforced. Saving these changes will create a new immutable version.
          </Typography>
          
          <Grid container spacing={2}>
            {Object.keys(formValues).map((key) => (
              <Grid size={{ xs: 12, sm: 4 }} key={key}>
                <TextField
                  fullWidth
                  label={key}
                  value={formValues[key]}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    if ((val.match(/\./g) || []).length <= 1) {
                      setFormValues({ ...formValues, [key]: val === "" ? 0 : val as any });
                    }
                  }}
                  inputProps={{
                    inputMode: 'decimal',
                    pattern: '[0-9]*\\.?[0-9]*',
                  }}
                  InputProps={{
                    endAdornment: <Typography variant="caption" sx={{ opacity: 0.5 }}>cm</Typography>
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            ))}
            
            {/* Add ability to add new fields could go here, but for now we stick to existing/defaults */}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsModalOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleUpdateSubmit}
            disabled={updateMutation.isPending}
            sx={{ borderRadius: '12px', px: 4, fontWeight: 700 }}
          >
            {updateMutation.isPending ? 'Saving...' : 'Commit Version'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
