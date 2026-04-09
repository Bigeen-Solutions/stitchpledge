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
import { useInventory, useReceiveShipment } from '../features/inventory/useInventory';
import { WorkshopTable } from '../components/ui/WorkshopTable';
import { WorkshopTableSkeleton } from '../components/ui/WorkshopTableSkeleton';
import { ErrorState } from '../components/feedback/ErrorState';

export function InventoryPage() {
  const { data: inventory, isLoading, isError, error, refetch } = useInventory();
  const receiveMutation = useReceiveShipment();

  const [selectedMaterial, setSelectedMaterial] = useState<{ id: string, name: string } | null>(null);
  const [receiveData, setReceiveData] = useState({ quantity: '', notes: '' });

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
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <InventoryIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>The Material Vault</Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Physical stock ledger and real-time inventory positions. Immutable and event-driven.
        </Typography>
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
                type="number"
                fullWidth
                value={receiveData.quantity}
                onChange={(e) => setReceiveData({ ...receiveData, quantity: e.target.value })}
                autoFocus
                placeholder="0.00"
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
    </Box>
  );
}
