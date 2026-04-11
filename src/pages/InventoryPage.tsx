import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Stack,
  alpha,
  MenuItem
} from '@mui/material';
import { 
  Add as AddIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import { useInventory, useReceiveShipment, useRegisterMaterial } from '../features/inventory/useInventory';
import { WorkshopTable } from '../components/ui/WorkshopTable';
import { WorkshopTableSkeleton } from '../components/ui/WorkshopTableSkeleton';
import { ErrorState } from '../components/feedback/ErrorState';

export function InventoryPage() {
  const { data: inventory, isLoading, isError, error, refetch } = useInventory();
  const receiveMutation = useReceiveShipment();
  const registerMutation = useRegisterMaterial();
 
  const [selectedMaterial, setSelectedMaterial] = useState<{ id: string, name: string } | null>(null);
  const [receiveData, setReceiveData] = useState({ quantity: '', notes: '' });
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', sku: '', canonicalUnit: 'Yards' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleOpenReceive = (material: { materialId: string, name: string }) => {
    setSelectedMaterial({ id: material.materialId, name: material.name });
    setReceiveData({ quantity: '', notes: 'Shipment received' });
  };

  const handleCloseReceive = () => {
    setSelectedMaterial(null);
    setReceiveData({ quantity: '', notes: '' });
  };

  const handleSubmitReceive = async () => {
    if (!selectedMaterial || !receiveData.quantity) return;
    
    await receiveMutation.mutateAsync({
      materialId: selectedMaterial.id,
      quantity: parseFloat(receiveData.quantity),
      notes: receiveData.notes
    });
    
    handleCloseReceive();
  };
 
  const handleRegisterMaterial = async () => {
    if (!newMaterial.name || !newMaterial.canonicalUnit) return;
    
    const formData = new FormData();
    formData.append('name', newMaterial.name);
    if (newMaterial.sku) formData.append('sku', newMaterial.sku);
    formData.append('canonicalUnit', newMaterial.canonicalUnit);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    await registerMutation.mutateAsync(formData as any);
    setIsRegisterOpen(false);
    setNewMaterial({ name: '', sku: '', canonicalUnit: 'Yards' });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  if (isError) {
    return (
      <Box className="container mt-xl">
        <ErrorState 
          error={error} 
          onRetry={() => refetch()} 
          title="The Vault Door is Jammed"
        />
      </Box>
    );
  }

  return (
    <Box className="container">
      <header style={{ marginBottom: 40 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          spacing={3}
        >
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <InventoryIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>The Material Vault</Typography>
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Physical stock ledger and real-time inventory positions. Immutable and event-driven.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setIsRegisterOpen(true)}
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 700, 
              bgcolor: '#1e5c3a',
              px: 3,
              py: { xs: 1.5, sm: 1 },
              '&:hover': { bgcolor: '#277a4d' }
            }}
          >
            Register New Material
          </Button>
        </Stack>
      </header>

      {isLoading ? (
        <WorkshopTableSkeleton headers={['Material Name', 'SKU', 'Total Ledger', 'Reserved', 'Available', 'Actions']} />
      ) : (
        <section className="sf-card sf-glass" style={{ padding: 'var(--space-lg)' }}>
          <WorkshopTable headers={['Material Name', 'SKU', 'Total Ledger', 'Reserved', 'Available', 'Actions']}>
            {inventory?.map((item) => (
              <tr key={item.materialId}>
                <td>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {item.imageUrl ? (
                      <Box 
                        component="img" 
                        src={item.imageUrl} 
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: '8px', 
                          objectFit: 'cover', 
                          border: '1px solid',
                          borderColor: 'divider'
                        }} 
                      />
                    ) : (
                      <Box sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '8px', 
                        bgcolor: alpha('#000', 0.05), 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <InventoryIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                      </Box>
                    )}
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Unit: {item.unit}</Typography>
                    </Box>
                  </Stack>
                </td>
                <td>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{item.sku || 'N/A'}</Typography>
                </td>
                <td>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{item.totalLedger}</Typography>
                </td>
                <td>
                  <Typography variant="body1" sx={{ color: item.activeReservations > 0 ? 'secondary.main' : 'text.disabled' }}>
                    {item.activeReservations}
                  </Typography>
                </td>
                <td>
                  <Box sx={{ 
                    display: 'inline-block', 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: '8px',
                    bgcolor: item.quantityAvailable > 0 ? alpha('#1e5c3a', 0.1) : alpha('#d32f2f', 0.1),
                    color: item.quantityAvailable > 0 ? 'primary.main' : 'error.main',
                    fontWeight: 800
                  }}>
                    {item.quantityAvailable} {item.unit}
                  </Box>
                </td>
                <td>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<ShippingIcon />}
                    onClick={() => handleOpenReceive(item)}
                    sx={{ borderRadius: '8px', fontWeight: 700 }}
                  >
                    Receive Shipment
                  </Button>
                </td>
              </tr>
            ))}
          </WorkshopTable>
        </section>
      )}

      {/* RECEIVE SHIPMENT MODAL */}
      <Dialog 
        open={Boolean(selectedMaterial)} 
        onClose={handleCloseReceive}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Receive Shipment</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Logging incoming stock for: <strong style={{ color: 'var(--color-primary)' }}>{selectedMaterial?.name}</strong>
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                label="Quantity (Yards/Units)"
                fullWidth
                value={receiveData.quantity}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  if ((val.match(/\./g) || []).length <= 1) {
                    setReceiveData({ ...receiveData, quantity: val });
                  }
                }}
                inputProps={{
                  inputMode: 'decimal',
                  pattern: '[0-9]*\\.?[0-9]*',
                }}
                autoFocus
                placeholder="0.00"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={receiveData.notes}
                onChange={(e) => setReceiveData({ ...receiveData, notes: e.target.value })}
                placeholder="e.g. Italian Wool Shipment #104"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseReceive} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitReceive}
            disabled={!receiveData.quantity || receiveMutation.isPending}
            startIcon={<AddIcon />}
            sx={{ borderRadius: '12px', fontWeight: 700, px: 3 }}
          >
            {receiveMutation.isPending ? 'Logging...' : 'Confirm Shipment'}
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* REGISTER MATERIAL MODAL */}
      <Dialog 
        open={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Register New Material</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            <Stack spacing={2.5}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>
                  Visual Verification
                </Typography>
                <Stack spacing={2} alignItems="center">
                  {imagePreview ? (
                    <Box 
                      component="img" 
                      src={imagePreview} 
                      sx={{ width: '100%', height: 160, borderRadius: '16px', objectFit: 'cover', border: '1px solid var(--color-border)' }} 
                    />
                  ) : (
                    <Box sx={{ 
                      width: '100%', 
                      height: 120, 
                      borderRadius: '16px', 
                      border: '2px dashed',
                      borderColor: 'divider',
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: alpha('#000', 0.02)
                    }}>
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>No Fabric Photo Captured</Typography>
                    </Box>
                  )}
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                  >
                    {imagePreview ? 'Retake Photo' : 'Capture Fabric Photo'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                    />
                  </Button>
                </Stack>
              </Box>

              <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>
                Material Metadata
              </Typography>
              
              <TextField
                label="Material Name"
                fullWidth
                size="small"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                placeholder="e.g. Italian Merino Wool"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="SKU / Reference"
                fullWidth
                size="small"
                value={newMaterial.sku}
                onChange={(e) => setNewMaterial({ ...newMaterial, sku: e.target.value })}
                placeholder="e.g. WOO-MER-IT-001"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                select
                label="Canonical Unit"
                fullWidth
                size="small"
                value={newMaterial.canonicalUnit}
                onChange={(e) => setNewMaterial({ ...newMaterial, canonicalUnit: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              >
                <MenuItem value="Yards">Yards</MenuItem>
                <MenuItem value="Meters">Meters</MenuItem>
                <MenuItem value="Pieces">Pieces</MenuItem>
                <MenuItem value="Boxes">Boxes</MenuItem>
              </TextField>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsRegisterOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleRegisterMaterial}
            disabled={!newMaterial.name || registerMutation.isPending}
            sx={{ borderRadius: '12px', fontWeight: 700, px: 3, bgcolor: '#1e5c3a' }}
          >
            {registerMutation.isPending ? 'Registering...' : 'Register Material'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
