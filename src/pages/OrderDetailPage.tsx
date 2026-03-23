import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const showToast = useToastStore((state) => state.showToast);
  const { isCompanyAdminOrManager } = usePermissions();
  const { data: detail, isLoading, isError } = useOrderDetail(id!);
  const { data: garments, isLoading: isLoadingGarments, refetch: refetchGarments } = useOrderGarments(id!);
  const { data: staff } = useStaffList({ enabled: isCompanyAdminOrManager });
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
    <div className="order-detail-page container">
      {/* SECTION A: THE HEADER */}
      <header className="mb-lg flex justify-between items-start p-lg sf-card sf-glass">
        <div>
          <div className="text-xs text-muted uppercase tracking-widest font-bold mb-xs">Production Record</div>
          <h1 className="text-h1">{order.orderNumber}</h1>
          <div className="flex gap-md mt-sm">
            <div>
              <span className="text-muted text-xs block">Customer</span>
              <span className="font-bold text-black">{order.customerName}</span>
            </div>
            <div className="border-l border-sf-border pl-md">
              <span className="text-muted text-xs block">Event Date</span>
              <span className="font-bold text-black">{new Date(order.eventDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-sm">
          <div className={`badge ${riskBadgeClass} py-2 px-4 text-sm font-bold shadow-sm`}>
            {projection.riskLevel.replace('_', ' ')}
          </div>
          <div className="text-xs text-muted">
            Last projection: {new Date(projection.calculatedAt).toLocaleTimeString()}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-xl">
        {/* SECTION B: GARMENT LIST */}
        <div className="col-span-4 flex flex-col gap-lg">
          <div className="sf-card p-md">
            <h3 className="text-h3 mb-md">Garments</h3>
            <div className="flex flex-col gap-sm">
              {garments?.map((garment) => (
                <button
                  key={garment.id}
                  onClick={() => setSelectedGarmentId(garment.id)}
                  className={`flex justify-between items-center p-md rounded-lg transition-all border ${
                    selectedGarmentId === garment.id 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-sf-border hover:border-muted'
                  }`}
                >
                  <div className="text-left">
                    <div className={selectedGarmentId === garment.id ? 'font-bold text-black' : 'text-black'}>
                      {garment.name}
                    </div>
                    {garment.assignedTailorId && (
                      <div className="text-[10px] text-primary font-bold uppercase mt-xs">
                        Tailor: {staff?.find(s => s.id === garment.assignedTailorId)?.email || 'Assigned'}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted uppercase font-bold">{garment.status}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedGarment && isCompanyAdminOrManager && (
            <div className="sf-card p-md bg-sf-glass border-primary/20">
              <h4 className="text-xs font-bold uppercase mb-md">Production Assignment</h4>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="assign-tailor-label">Assign Tailor</InputLabel>
                <Select
                  labelId="assign-tailor-label"
                  value={selectedGarment.assignedTailorId || ''}
                  label="Assign Tailor"
                  onChange={(e) => handleAssignTailor(e.target.value)}
                  sx={{ color: 'black' }}
                >
                  <MenuItem value=""><em>Unassigned</em></MenuItem>
                  {tailors.map(t => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}
          
          <div className="sf-card p-md">
            <h3 className="text-h3 mb-md">Quick Actions</h3>
            <div className="grid gap-md">
              <RecordMeasurementForm orderId={order.id} />
              <MaterialAdjustmentForm orderId={order.id} />
            </div>
          </div>
        </div>

        {/* SECTION C: WORKFLOW DAG */}
        <div className="col-span-8">
          {selectedGarmentId ? (
            <WorkflowGraph garmentId={selectedGarmentId} orderId={order.id} />
          ) : (
            <div className="sf-card p-xl text-center text-muted">
              Select a garment to view production workflow
            </div>
          )}
        </div>
      </div>

      {/* History Sections */}
      <div className="grid grid-cols-2 gap-xl mt-xl">
        <div className="sf-card p-md">
          <MaterialHistory orderId={order.id} />
        </div>
        <div className="sf-card p-md">
          <MeasurementHistory orderId={order.id} />
        </div>
      </div>
    </div>
  );
}
