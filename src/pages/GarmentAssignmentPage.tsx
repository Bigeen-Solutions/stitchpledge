import { useState } from 'react';
import { useActiveTasks } from '../features/workflow/hooks/useProductionBoard';
import { useStaffList } from '../features/auth/hooks/useStaff';
import { usePermissions } from '../features/auth/use-permissions';
import { ordersApi } from '../features/orders/orders.api';
import { useToastStore } from '../components/feedback/Toast';
import { WorkshopTable } from '../components/ui/WorkshopTable';
import { RiskBadge } from '../components/ui/RiskBadge';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';

export function GarmentAssignmentPage() {
  const { data: tasks, isLoading, isError, refetch } = useActiveTasks();
  const { isCompanyAdminOrManager } = usePermissions();
  const { data: staff } = useStaffList({ enabled: isCompanyAdminOrManager });
  const showToast = useToastStore((state) => state.showToast);

  const tailors = staff?.filter(s => s.role === 'TAILOR') || [];

  const handleAssignTailor = async (garmentId: string, tailorId: string) => {
    try {
      await ordersApi.assignTailor(garmentId, tailorId || null);
      showToast("Assignment updated successfully", "success");
      refetch();
    } catch (err) {
      showToast("Failed to update assignment", "error");
    }
  };

  if (isLoading) return <div className="sf-loading-overlay sf-glass">Syncing Assignment Backlog...</div>;
  if (isError) return <div className="container p-lg"><h1>Error</h1><p>Failed to load garments for assignment.</p></div>;

  // Filter for unique garments (since tasks are stage-level, but assignment is garment-level)
  const uniqueGarments = Array.from(new Map(tasks?.map(t => [t.garmentId, t])).values());

  return (
    <div className="garment-assignment-page container">
      <header className="mb-lg">
        <h1 className="text-h1">Production Assignment</h1>
        <p className="text-muted">Deploy your specialized workforce to active production garments.</p>
      </header>

      <section className="sf-card p-lg">
        <WorkshopTable headers={['Order #', 'Customer', 'Garment', 'Status', 'Risk', 'Assigned Tailor']}>
          {uniqueGarments.map((garment) => (
            <tr key={garment.garmentId}>
              <td className="font-bold text-black">{garment.orderId.split('-')[0].toUpperCase()}</td>
              <td className="text-black font-medium">{garment.customerName}</td>
              <td className="text-black">{garment.garmentName}</td>
              <td>
                <span className="text-xs text-muted uppercase font-bold">{garment.stageName}</span>
              </td>
              <td><RiskBadge level={garment.riskLevel} /></td>
              <td>
                <FormControl fullWidth variant="outlined" size="small">
                  <Select
                    value={garment.assignedTailorId || ''}
                    onChange={(e) => handleAssignTailor(garment.garmentId, e.target.value)}
                    displayEmpty
                    sx={{ color: garment.assignedTailorId ? 'black' : 'var(--color-danger)', fontWeight: garment.assignedTailorId ? 500 : 700 }}
                  >
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {tailors.map(t => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
            </tr>
          ))}
        </WorkshopTable>
      </section>
    </div>
  );
}
