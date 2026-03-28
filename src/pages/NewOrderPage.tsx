import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Grid,
  Card,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  alpha
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  BusinessCenter as SuitIcon,
  Checkroom as ShirtIcon,
  Straighten as TrousersIcon,
  CalendarMonth as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  EmojiEvents as EventIcon
} from "@mui/icons-material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { useCustomerSearch, useCreateCustomer, useCreateMeasurement } from "../features/customers/hooks/useCustomerIntake";
import { useWorkflowTemplates } from "../features/workflow/hooks/useWorkflowTemplates";
import { useAuthStore } from "../features/auth/auth.store";
import { useStores, useStaffList } from "../features/auth/hooks/useStaff";
import { usePermissions } from "../features/auth/use-permissions";
import { ordersApi } from "../features/orders/orders.api";
import { useToastStore } from "../components/feedback/Toast";

type Step = "CLIENT_SELECTION" | "CLIENT_DETAILS" | "GARMENTS_TIMELINE" | "MEASUREMENTS" | "SUMMARY";

const GARMENT_TYPES = [
  { id: 'suit', label: 'Suit', icon: <SuitIcon sx={{ fontSize: 40 }} />, description: 'Full executive tailoring' },
  { id: 'shirt', label: 'Shirt', icon: <ShirtIcon sx={{ fontSize: 40 }} />, description: 'Bespoke fit & fabric' },
  { id: 'trousers', label: 'Trousers', icon: <TrousersIcon sx={{ fontSize: 40 }} />, description: 'Precision leg wear' },
];

export function NewOrderPage() {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const { isCompanyAdminOrManager, role } = usePermissions();
  const user = useAuthStore((state) => state.user);
  const { data: stores } = useStores();
  const { data: templates } = useWorkflowTemplates();
  const createCustomer = useCreateCustomer();
  const createMeasurement = useCreateMeasurement();
  const { data: staff } = useStaffList({ enabled: isCompanyAdminOrManager });

  const tailors = useMemo(() => {
    const list = [...(staff?.filter(s => s.role === 'TAILOR') || [])];
    if (role === 'TAILOR' && user && !list.find(s => s.id === user.userId)) {
      list.push({ id: user.userId, email: user.email, role: 'TAILOR' } as any);
    }
    return list;
  }, [staff, role, user]);

  const [step, setStep] = useState<Step>("CLIENT_SELECTION");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, isLoading: isSearching } = useCustomerSearch(searchQuery);

  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
  const [measurements, setMeasurements] = useState<Record<string, number>>({
    Chest: 100, Waist: 85, Inseam: 78, Sleeve: 62, Shoulder: 46, Neck: 40,
  });
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [garments, setGarments] = useState<{
    workflowTemplateId: string;
    estimatedTotalDurationHours: number;
    assignedTailorId?: string | null;
  }[]>([]);

  const handleCreateOrder = async () => {
    try {
      let finalCustomerId = selectedCustomer?.id;
      let finalCustomerName = selectedCustomer?.name;

      if (!finalCustomerId) {
        if (!newCustomer.name.trim()) throw new Error("Customer identification is required.");
        showToast("Creating new customer profile...", "success");
        const c = await createCustomer.mutateAsync(newCustomer);
        finalCustomerId = c.id;
        finalCustomerName = c.name;
      }

      showToast("Recording immutable measurements...", "success");
      const mv = await createMeasurement.mutateAsync({
        customerId: finalCustomerId,
        measurements
      });

      if (!mv?.id) throw new Error("Critical: Measurement version ID not returned by system.");

      const finalStoreId = user?.role === 'COMPANY_ADMIN' ? selectedStoreId : user?.storeId;
      if (!finalStoreId) {
        showToast("Store assignment is required. Please contact admin.", "error");
        return;
      }

      showToast("Finalizing order & calculating risk...", "success");
      await ordersApi.createOrder({
        customerId: finalCustomerId,
        customerName: finalCustomerName.trim(),
        storeId: finalStoreId,
        eventDate: eventDate ? eventDate.toISOString() : new Date().toISOString(),
        lockedMeasurementVersionId: mv.id,
        garments: garments.map(g => ({
          workflowTemplateId: g.workflowTemplateId,
          assignedTailorId: g.assignedTailorId || null,
          estimatedTotalDurationHours: g.estimatedTotalDurationHours || 24
        }))
      });

      showToast("Order intake complete. Redirecting to dashboard.", "success");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("[Intake Engine Error]", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to finalize order";
      showToast(errorMessage, "error");
    }
  };

  const addGarmentByTemplate = (templateName: string) => {
    const template = templates?.find(t => t.name.toLowerCase().includes(templateName.toLowerCase()));
    if (template) {
      setGarments([...garments, {
        workflowTemplateId: template.id,
        estimatedTotalDurationHours: 24,
        assignedTailorId: role === 'TAILOR' ? user?.userId : null
      }]);
      showToast(`${template.name} added to order items`, "success");
    } else {
      showToast(`Workflow template for "${templateName}" not found.`, "warning");
    }
  };

  const steps: Step[] = ["CLIENT_SELECTION", "CLIENT_DETAILS", "GARMENTS_TIMELINE", "MEASUREMENTS", "SUMMARY"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      pt: 8,
      pb: 12,
      px: { xs: 2, md: 4 }
    }}>
      <Box className="container" sx={{ maxWidth: 900, mx: 'auto' }}>
        <header style={{ marginBottom: 40, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            Production Intake
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Precision order capture for the modern atelier.
          </Typography>
        </header>

        {/* STEP INDICATOR */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 6,
          position: 'relative',
          px: 4
        }}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: '2px',
            bgcolor: 'divider',
            mt: '-1px',
            zIndex: 0
          }} />
          {steps.filter(s => s !== "CLIENT_DETAILS" || !selectedCustomer).map((s, idx) => (
            <Box
              key={s}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                zIndex: 1,
                transition: 'all 0.3s ease',
                bgcolor: step === s ? 'secondary.main' : (steps.indexOf(step) > steps.indexOf(s) ? 'primary.main' : 'background.paper'),
                color: step === s || steps.indexOf(step) > steps.indexOf(s) ? 'white' : 'text.secondary',
                border: steps.indexOf(step) <= steps.indexOf(s) && step !== s ? '2px solid' : 'none',
                borderColor: 'divider',
                boxShadow: step === s ? `0 0 15px ${alpha('#c49a1a', 0.3)}` : 'none',
                transform: step === s ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {idx + 1}
            </Box>
          ))}
        </Box>

        <Card sx={{
          borderRadius: '24px',
          p: { xs: 3, md: 6 },
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}>

          {/* STEP 0: CLIENT SELECTION */}
          {step === "CLIENT_SELECTION" && (
            <Box className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: 'text.primary' }}>1. Perimeter: Client Identification</Typography>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                    Search Infrastructure
                  </Typography>
                  <Autocomplete
                    options={searchResults || []}
                    getOptionLabel={(option: any) => `${option.name} (${option.phone || option.email || 'N/A'})`}
                    loading={isSearching}
                    onInputChange={(_, value) => setSearchQuery(value)}
                    onChange={(_, value) => {
                      if (value) {
                        setSelectedCustomer(value);
                        setStep("GARMENTS_TIMELINE");
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search existing clients..."
                        variant="outlined"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: 64,
                            bgcolor: 'background.default',
                            borderRadius: '12px',
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderColor: 'secondary.main' },
                          },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                          endAdornment: (
                            <>
                              {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>OR</Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => setStep("CLIENT_DETAILS")}
                    sx={{
                      height: 64,
                      borderRadius: '12px',
                      borderColor: 'divider',
                      color: 'primary.main',
                      fontSize: 16,
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: alpha('#1e5c3a', 0.04)
                      }
                    }}
                  >
                    Add New Client Profile
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}

          {/* STEP 1: CLIENT DETAILS (NEW CLIENT ONLY) */}
          {step === "CLIENT_DETAILS" && (
            <Box className="animate-in fade-in slide-in-from-right-4 duration-500">
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: 'text.primary' }}>2. The Mint: Personal Details</Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 60,
                      bgcolor: 'background.default',
                      '& fieldset': { borderColor: 'divider' },
                    },
                    '& .MuiInputLabel-root': { color: 'text.secondary' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 60,
                      bgcolor: 'background.default',
                      '& fieldset': { borderColor: 'divider' },
                    },
                    '& .MuiInputLabel-root': { color: 'text.secondary' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 60,
                      bgcolor: 'background.default',
                      '& fieldset': { borderColor: 'divider' },
                    },
                    '& .MuiInputLabel-root': { color: 'text.secondary' }
                  }}
                />
                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                  <Button
                    onClick={() => setStep("CLIENT_SELECTION")}
                    sx={{ color: 'text.primary', textTransform: 'none' }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!newCustomer.name}
                    onClick={() => setStep("GARMENTS_TIMELINE")}
                    sx={{ bgcolor: 'secondary.main', height: 60, borderRadius: '12px', '&:hover': { bgcolor: '#d4aa2a' } }}
                  >
                    Proceed to Garment Configuration
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}

          {/* STEP 2: GARMENT & TIMELINE */}
          {step === "GARMENTS_TIMELINE" && (
            <Box className="animate-in fade-in slide-in-from-right-4 duration-500">
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: 'text.primary' }}>3. Visual Data Entry: Garment & Timeline</Typography>

              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 2, display: 'block' }}>
                    Select Garment Types
                  </Typography>
                  <Grid container spacing={2}>
                    {GARMENT_TYPES.map((type) => (
                      <Grid size={{ xs: 4 }} key={type.id}>
                        <Card
                          onClick={() => addGarmentByTemplate(type.label)}
                          sx={{
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '16px',
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha('#1e5c3a', 0.04),
                              transform: 'translateY(-4px)',
                              borderColor: 'secondary.main',
                              boxShadow: `0 0 20px ${alpha('#c49a1a', 0.2)}`
                            },
                            '&:active': { transform: 'scale(0.95)' }
                          }}
                        >
                          <Box sx={{ color: 'secondary.main', mb: 1.5 }}>
                            {type.icon}
                          </Box>
                          <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>{type.label}</Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ mt: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 2, display: 'block' }}>
                      Order Items List
                    </Typography>
                    <Stack spacing={2}>
                      {garments.map((g, idx) => (
                        <Box key={idx} sx={{
                          p: 2,
                          bgcolor: 'background.default',
                          borderRadius: '12px',
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1, bgcolor: alpha('#c49a1a', 0.1), borderRadius: '8px', color: 'secondary.main' }}>
                              {templates?.find(t => t.id === g.workflowTemplateId)?.name.includes('Suit') ? <SuitIcon /> :
                               templates?.find(t => t.id === g.workflowTemplateId)?.name.includes('Shirt') ? <ShirtIcon /> : <TrousersIcon />}
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{templates?.find(t => t.id === g.workflowTemplateId)?.name}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>24h duration estimate</Typography>
                            </Box>
                          </Stack>
                          <IconButton size="small" onClick={() => setGarments(garments.filter((_, i) => i !== idx))} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                      {garments.length === 0 && (
                        <Box sx={{ p: 4, border: '1px dashed', borderColor: 'divider', borderRadius: '12px', textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>No garments selected yet.</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 2, display: 'block' }}>
                    Production Deadline
                  </Typography>
                  <Box sx={{
                    bgcolor: 'background.default',
                    borderRadius: '16px',
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateCalendar
                        value={eventDate}
                        onChange={(newValue) => setEventDate(newValue)}
                      />
                    </LocalizationProvider>
                  </Box>
                  <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#c49a1a', 0.05), borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <EventIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, textTransform: 'uppercase' }}>
                      {eventDate ? `Selected: ${eventDate.toLocaleDateString()}` : 'Pick a deadline for risk projection'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                  onClick={() => setStep(selectedCustomer ? "CLIENT_SELECTION" : "CLIENT_DETAILS")}
                  sx={{ color: 'text.primary' }}
                  startIcon={<ArrowBackIcon />}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  disabled={garments.length === 0 || !eventDate}
                  onClick={() => setStep("MEASUREMENTS")}
                  sx={{
                    bgcolor: 'secondary.main',
                    height: 52,
                    px: 6,
                    borderRadius: '12px',
                    '&:hover': { bgcolor: '#d4aa2a', boxShadow: `0 0 20px ${alpha('#c49a1a', 0.4)}` }
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Capture Measurements
                </Button>
              </Stack>
            </Box>
          )}

          {/* STEP: MEASUREMENTS */}
          {step === "MEASUREMENTS" && (
            <Box className="animate-in fade-in slide-in-from-right-4 duration-500">
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: 'text.primary' }}>4. Recording Measurements (cm)</Typography>
              <Grid container spacing={2}>
                {Object.keys(measurements).map(key => (
                  <Grid size={{ xs: 6, sm: 4 }} key={key}>
                    <TextField
                      fullWidth
                      label={key}
                      type="number"
                      size="small"
                      value={measurements[key]}
                      onChange={(e) => setMeasurements({ ...measurements, [key]: Number(e.target.value) })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'background.default',
                          '& fieldset': { borderColor: 'divider' },
                        },
                        '& .MuiInputLabel-root': { color: 'text.secondary' }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 4 }} />
              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button onClick={() => setStep("GARMENTS_TIMELINE")} sx={{ color: 'text.primary' }}>Back</Button>
                <Button
                  variant="contained"
                  onClick={() => setStep("SUMMARY")}
                  sx={{ bgcolor: 'secondary.main', height: 52, px: 6, borderRadius: '12px', '&:hover': { bgcolor: '#d4aa2a' } }}
                >
                  Review Order
                </Button>
              </Stack>
            </Box>
          )}

          {/* STEP: SUMMARY */}
          {step === "SUMMARY" && (
            <Box className="animate-in zoom-in-95 duration-300">
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: 'text.primary' }}>5. Formalize Order</Typography>

              <Stack spacing={3}>
                <Box sx={{ p: 4, bgcolor: alpha('#1e5c3a', 0.04), border: '1px solid', borderColor: 'divider', borderRadius: '20px' }}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700 }}>Customer Identity</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>{selectedCustomer?.name || newCustomer.name}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{selectedCustomer?.email || newCustomer.email || 'No email provided'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700 }}>Production Deadline</Typography>
                      <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 700 }}>{eventDate?.toLocaleDateString()}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Assignment: {stores?.find(s => s.id === selectedStoreId)?.name || user?.storeId || 'Unassigned'}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700, mb: 1, display: 'block' }}>Line Items ({garments.length})</Typography>
                  <Stack spacing={1}>
                    {garments.map((g, i) => (
                      <Box key={i} sx={{ px: 3, py: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{templates?.find(t => t.id === g.workflowTemplateId)?.name}</Typography>
                        <Typography variant="caption" sx={{ bgcolor: alpha('#c49a1a', 0.2), color: 'secondary.main', px: 1.5, py: 0.5, borderRadius: '99px', fontWeight: 700 }}>PENDING START</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={2} sx={{ pt: 4 }}>
                  <Button onClick={() => setStep("MEASUREMENTS")} sx={{ color: 'text.primary' }}>Back</Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleCreateOrder}
                    sx={{
                      height: 64,
                      bgcolor: 'primary.main',
                      borderRadius: '16px',
                      fontWeight: 700,
                      fontSize: 18,
                      boxShadow: `0 0 30px ${alpha('#1e5c3a', 0.2)}`,
                      '&:hover': { bgcolor: '#256b45' }
                    }}
                  >
                    Commit to Production
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
