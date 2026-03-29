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
  alpha,
  Dialog
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  BusinessCenter as SuitIcon,
  Checkroom as ShirtIcon,
  Straighten as TrousersIcon,
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
import { useStores } from "../features/auth/hooks/useStaff";
import { usePermissions } from "../features/auth/use-permissions";
import { ordersApi } from "../features/orders/orders.api";
import { useToastStore } from "../components/feedback/Toast";

type Step = "CLIENT_SELECTION" | "CLIENT_DETAILS" | "GARMENTS_TIMELINE" | "FABRIC_DETAILS" | "MEASUREMENTS" | "SUMMARY";

const getGarmentIcon = (templateName: string) => {
  const name = templateName.toLowerCase();
  if (name.includes('suit')) return <SuitIcon />;
  if (name.includes('shirt')) return <ShirtIcon />;
  if (name.includes('trouser') || name.includes('pant')) return <TrousersIcon />;
  return <ShirtIcon />; // Fallback
};

const getGarmentIconLarge = (templateName: string) => {
  const name = templateName.toLowerCase();
  if (name.includes('suit')) return <SuitIcon sx={{ fontSize: 40 }} />;
  if (name.includes('shirt')) return <ShirtIcon sx={{ fontSize: 40 }} />;
  if (name.includes('trouser') || name.includes('pant')) return <TrousersIcon sx={{ fontSize: 40 }} />;
  return <ShirtIcon sx={{ fontSize: 40 }} />;
};

export function NewOrderPage() {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const { role } = usePermissions();
  const user = useAuthStore((state) => state.user);
  const { data: stores } = useStores();
  const { data: templates } = useWorkflowTemplates();
  const createCustomer = useCreateCustomer();
  const createMeasurement = useCreateMeasurement();


  const [step, setStep] = useState<Step>("CLIENT_SELECTION");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, isLoading: isSearching } = useCustomerSearch(searchQuery);

  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [activeMeasurementField, setActiveMeasurementField] = useState<string | null>(null);
  const [fabricDetails, setFabricDetails] = useState({
    fabricImageBase64: "",
    fabricType: "Cotton",
    colorSwatch: "#000000",
    designNotes: ""
  });
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [selectedStoreId] = useState("");
  const [orderItems, setOrderItems] = useState<{
    templateId: string;
    estimatedTotalDurationHours: number;
    assignedTailorId?: string | null;
  }[]>([]);
  const [successOrder, setSuccessOrder] = useState<{ id: string } | null>(null);

  // THE AGGREGATION FORGE
  const dynamicMeasurementFields = useMemo(() => {
    if (!templates || !orderItems || orderItems.length === 0) return [];
    const uniqueFields = new Set<string>();
    
    orderItems.forEach(item => {
      const templateDef: any = templates.find((t: any) => t.id === item.templateId);
      if (templateDef) {
        // Handle both camelCase and snake_case from backend definitions
        const measurements = templateDef.requiredMeasurements || templateDef["required_measurements"] || [];
        measurements.forEach((m: string) => uniqueFields.add(m));
      }
    });
    return Array.from(uniqueFields);
  }, [orderItems, templates]);

  // Sync state keys when required keys change
  useMemo(() => {
    setMeasurements(prev => {
      const next = { ...prev };
      let changed = false;
      dynamicMeasurementFields.forEach(k => {
        if (next[k] === undefined) {
          next[k] = "";
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [dynamicMeasurementFields]);

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
      const numericMeasurements: Record<string, number> = {};
      Object.keys(measurements).forEach(k => {
        numericMeasurements[k] = parseFloat(measurements[k]) || 0;
      });

      const mv = await createMeasurement.mutateAsync({
        customerId: finalCustomerId,
        measurements: numericMeasurements
      });

      if (!mv?.id) throw new Error("Critical: Measurement version ID not returned by system.");

      const finalStoreId = role === 'COMPANY_ADMIN' ? selectedStoreId : user?.storeId;
      if (!finalStoreId) {
        showToast("Store assignment is required. Please contact admin.", "error");
        return;
      }

      showToast("Finalizing order & calculating risk...", "success");
      const result = await ordersApi.createOrder({
        customerId: finalCustomerId,
        customerName: finalCustomerName.trim(),
        storeId: finalStoreId,
        eventDate: eventDate ? eventDate.toISOString() : new Date().toISOString(),
        lockedMeasurementVersionId: mv.id,
        garments: orderItems.map(g => ({
          workflowTemplateId: g.templateId,
          assignedTailorId: g.assignedTailorId || null,
          estimatedTotalDurationHours: g.estimatedTotalDurationHours || 24,
          fabricImageBase64: fabricDetails.fabricImageBase64,
          fabricType: fabricDetails.fabricType,
          colorSwatch: fabricDetails.colorSwatch,
          designNotes: fabricDetails.designNotes
        }))
      });

      showToast("Order intake complete.", "success");
      // The API returns { order, initialProjection }
      setSuccessOrder(result.order || result);
    } catch (err: any) {
      console.error("[Intake Engine Error]", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to finalize order";
      showToast(errorMessage, "error");
    }
  };

  const addGarmentById = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setOrderItems([...orderItems, {
        templateId: template.id,
        estimatedTotalDurationHours: 24,
        assignedTailorId: role === 'TAILOR' ? user?.userId : null
      }]);
      showToast(`${template.name} added to order items`, "success");
    } else {
      showToast(`Workflow template not found.`, "warning");
    }
  };

  const steps: Step[] = ["CLIENT_SELECTION", "CLIENT_DETAILS", "GARMENTS_TIMELINE", "FABRIC_DETAILS", "MEASUREMENTS", "SUMMARY"];

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
                    {templates?.map((template) => (
                      <Grid size={{ xs: 6, sm: 4 }} key={template.id}>
                        <Card
                          onClick={() => addGarmentById(template.id)}
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
                            {getGarmentIconLarge(template.name)}
                          </Box>
                          <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>{template.name}</Typography>
                        </Card>
                      </Grid>
                    ))}
                    {(!templates || templates.length === 0) && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" sx={{ color: 'text.disabled', p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '12px' }}>
                          No production templates found. Configure them in Dashboard Settings.
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ mt: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 2, display: 'block' }}>
                      Order Items List
                    </Typography>
                    <Stack spacing={2}>
                      {orderItems.map((g, idx) => (
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
                              {getGarmentIcon(templates?.find(t => t.id === g.templateId)?.name || '')}
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{templates?.find(t => t.id === g.templateId)?.name}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>24h duration estimate</Typography>
                            </Box>
                          </Stack>
                          <IconButton size="small" onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                      {orderItems.length === 0 && (
                        <Box sx={{ p: 4, border: '1px dashed', borderColor: 'divider', borderRadius: '12px', textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>No items selected yet.</Typography>
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
                  disabled={orderItems.length === 0 || !eventDate}
                  onClick={() => setStep("FABRIC_DETAILS")}
                  sx={{
                    bgcolor: 'secondary.main',
                    height: 52,
                    px: 6,
                    borderRadius: '12px',
                    '&:hover': { bgcolor: '#d4aa2a', boxShadow: `0 0 20px ${alpha('#c49a1a', 0.4)}` }
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Define Fabric & Design
                </Button>
              </Stack>
            </Box>
          )}

          {/* STEP 3: FABRIC & DESIGN */}
          {step === "FABRIC_DETAILS" && (
            <Box className="animate-in fade-in slide-in-from-right-4 duration-500">
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: 'text.primary' }}>3. The Evidence: Fabric & Design</Typography>
              
              <Grid container spacing={4}>
                {/* Image Upload */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 2, display: 'block' }}>
                    Fabric Evidence
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.default',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': { borderColor: 'secondary.main', bgcolor: alpha('#c49a1a', 0.05) }
                    }}
                    onClick={() => document.getElementById('fabric-upload')?.click()}
                  >
                    {!fabricDetails.fabricImageBase64 ? (
                      <>
                        <AddIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Upload Fabric Image</Typography>
                      </>
                    ) : (
                      <img 
                        src={fabricDetails.fabricImageBase64} 
                        alt="Fabric preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    )}
                    <input
                      id="fabric-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFabricDetails({ ...fabricDetails, fabricImageBase64: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </Box>
                  {fabricDetails.fabricImageBase64 && (
                    <Button 
                      size="small" 
                      onClick={() => setFabricDetails({ ...fabricDetails, fabricImageBase64: "" })}
                      sx={{ mt: 1, textTransform: 'none', color: 'error.main' }}
                    >
                      Remove Photo
                    </Button>
                  )}
                </Grid>

                {/* Fabric Type & Swatch */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel>Material Type</InputLabel>
                      <Select
                        value={fabricDetails.fabricType}
                        label="Material Type"
                        onChange={(e) => setFabricDetails({ ...fabricDetails, fabricType: e.target.value })}
                        sx={{ borderRadius: '12px' }}
                      >
                        {['Wool', 'Cotton', 'Linen', 'Silk', 'Cashmere', 'Velvet'].map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
                        Color Swatch
                      </Typography>
                      <Stack direction="row" spacing={1.5} flexWrap="wrap">
                        {['#0F172A', '#475569', '#1E293B', '#FFFFFF', '#0EA5E9', '#7F1D1D', '#064E3B', '#C49A1A'].map(color => (
                          <Box
                            key={color}
                            onClick={() => setFabricDetails({ ...fabricDetails, colorSwatch: color })}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: color,
                              cursor: 'pointer',
                              border: '2px solid',
                              borderColor: fabricDetails.colorSwatch === color ? 'secondary.main' : (color === '#FFFFFF' ? 'divider' : 'transparent'),
                              boxShadow: fabricDetails.colorSwatch === color ? `0 0 10px ${alpha('#c49a1a', 0.5)}` : 'none',
                              transition: 'transform 0.2s',
                              outline: fabricDetails.colorSwatch === color ? `2px solid ${alpha('#c49a1a', 0.3)}` : 'none',
                              outlineOffset: 3,
                              '&:hover': { transform: 'scale(1.1)' }
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <TextField
                      fullWidth
                      label="Design Notes"
                      multiline
                      rows={3}
                      value={fabricDetails.designNotes}
                      onChange={(e) => setFabricDetails({ ...fabricDetails, designNotes: e.target.value })}
                      placeholder="Special lining, unique buttons, or specific stitching requests..."
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                      }}
                    />
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button onClick={() => setStep("GARMENTS_TIMELINE")} sx={{ color: 'text.primary' }}>Back</Button>
                <Button
                  variant="contained"
                  onClick={() => setStep("MEASUREMENTS")}
                  sx={{ bgcolor: 'secondary.main', height: 52, px: 6, borderRadius: '12px', '&:hover': { bgcolor: '#d4aa2a' } }}
                >
                  Capture Measurements
                </Button>
              </Stack>
            </Box>
          )}
          {step === "MEASUREMENTS" && (
            <Box className="animate-in fade-in slide-in-from-right-4 duration-500">
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: 'text.primary' }}>4. Recording Measurements (cm)</Typography>
              
              <Grid container spacing={4}>
                {/* Left Side: Measurement Inputs */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Grid container spacing={2}>
                    {dynamicMeasurementFields.map(key => (
                      <Grid size={{ xs: 12, sm: 4 }} key={key}>
                        <TextField
                          fullWidth
                          label={key}
                          value={measurements[key] || ""}
                          onFocus={() => setActiveMeasurementField(key)}
                          InputProps={{ readOnly: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: 60,
                              bgcolor: activeMeasurementField === key ? alpha('#c49a1a', 0.05) : 'background.default',
                              borderColor: activeMeasurementField === key ? 'secondary.main' : 'divider',
                              borderWidth: activeMeasurementField === key ? 2 : 1,
                              borderRadius: '12px',
                              cursor: 'pointer',
                              '& fieldset': { borderColor: activeMeasurementField === key ? 'secondary.main' : 'divider' },
                            },
                            '& .MuiInputLabel-root': { color: activeMeasurementField === key ? 'secondary.main' : 'text.secondary' }
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {/* Right Side: Virtual Numpad */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Card sx={{ 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: '20px', 
                    border: '1px solid', 
                    borderColor: 'divider',
                    boxShadow: 'none'
                  }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 2, display: 'block', textAlign: 'center' }}>
                      {activeMeasurementField ? `Input: ${activeMeasurementField}` : 'Select a field to enter value'}
                    </Typography>
                    
                    <Grid container spacing={1}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'BACK'].map((val) => (
                        <Grid size={{ xs: 4 }} key={val}>
                          <Button
                            fullWidth
                            variant="outlined"
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevent blurring the input
                              if (!activeMeasurementField) return;
                              
                              const currentVal = measurements[activeMeasurementField];
                              if (val === 'BACK') {
                                setMeasurements({ ...measurements, [activeMeasurementField]: currentVal.slice(0, -1) });
                              } else if (val === '.') {
                                if (!currentVal.includes('.')) {
                                  setMeasurements({ ...measurements, [activeMeasurementField]: currentVal + '.' });
                                }
                              } else {
                                // Max 5 digits for sanity
                                if (currentVal.length < 5) {
                                  setMeasurements({ ...measurements, [activeMeasurementField]: currentVal + val });
                                }
                              }
                            }}
                            sx={{
                              height: 70,
                              borderRadius: '12px',
                              fontSize: val === 'BACK' ? 14 : 24,
                              fontWeight: 700,
                              color: 'text.primary',
                              borderColor: 'divider',
                              bgcolor: 'background.paper',
                              '&:hover': { bgcolor: alpha('#c49a1a', 0.1), borderColor: 'secondary.main' },
                              '&:active': { transform: 'scale(0.95)' }
                            }}
                          >
                            {val === 'BACK' ? <DeleteIcon /> : val}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />
              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button onClick={() => setStep("FABRIC_DETAILS")} sx={{ color: 'text.primary' }}>Back</Button>
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

                <Box sx={{ p: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700, mb: 1, display: 'block' }}>Fabric & Design Evidence</Typography>
                  <Stack direction="row" spacing={3} alignItems="center">
                    {fabricDetails.fabricImageBase64 ? (
                      <Box sx={{ width: 60, height: 60, borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                        <img src={fabricDetails.fabricImageBase64} alt="Fabric" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ) : (
                      <Box sx={{ width: 60, height: 60, borderRadius: '12px', bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <ShirtIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
                      </Box>
                    )}
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: fabricDetails.colorSwatch, border: '1px solid', borderColor: 'divider' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{fabricDetails.fabricType}</Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, maxWidth: 300 }}>
                        {fabricDetails.designNotes || "No specific design notes."}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700, mb: 1, display: 'block' }}>Line Items ({orderItems.length})</Typography>
                  <Stack spacing={1}>
                    {orderItems.map((g, i) => (
                      <Box key={i} sx={{ px: 3, py: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{templates?.find(t => t.id === g.templateId)?.name}</Typography>
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

      {/* SUCCESS MODAL */}
      <Dialog 
        open={Boolean(successOrder)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', p: 4, textAlign: 'center' }
        }}
      >
        <Box sx={{ py: 2 }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: alpha('#1e5c3a', 0.1), 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mx: 'auto',
            mb: 3
          }}>
            <Box component="span" sx={{ fontSize: 48, color: 'primary.main' }}>✓</Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            Order Created Successfully
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            Order ID: <strong>{successOrder?.id?.split('-')[0].toUpperCase()}</strong>
          </Typography>
          <Stack spacing={2}>
            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              onClick={() => navigate(`/orders/${successOrder?.id}`)}
              sx={{ 
                bgcolor: 'primary.main', 
                height: 60, 
                borderRadius: '16px',
                fontWeight: 700,
                '&:hover': { bgcolor: '#256b45' }
              }}
            >
              View Order
            </Button>
            <Button 
              variant="outlined" 
              fullWidth 
              size="large"
              onClick={() => window.location.reload()}
              sx={{ 
                height: 60, 
                borderRadius: '16px',
                borderColor: 'divider',
                color: 'text.primary',
                fontWeight: 600
              }}
            >
              Start New Order
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}
