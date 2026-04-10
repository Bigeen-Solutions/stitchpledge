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
  alpha
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
    await registerMutation.mutateAsync(newMaterial);
    setIsRegisterOpen(false);
    setNewMaterial({ name: '', sku: '', canonicalUnit: 'Yards' });
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
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
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
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Unit: {item.unit}</Typography>
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
                label="Canonical Unit"
                fullWidth
                size="small"
                value={newMaterial.canonicalUnit}
                onChange={(e) => setNewMaterial({ ...newMaterial, canonicalUnit: e.target.value })}
                placeholder="e.g. Yards, Meters, Units"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
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
