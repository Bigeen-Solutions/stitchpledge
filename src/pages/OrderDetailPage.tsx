import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrderDetail, useOrderGarments } from '../features/orders/hooks/useOrderDetail.ts';
import { WorkflowGraph } from '../features/workflow/components/WorkflowGraph.tsx';
import { MaterialHistory } from '../features/materials/components/MaterialHistory.tsx';
import { MaterialAdjustmentForm } from '../features/materials/components/MaterialAdjustmentForm.tsx';
import { MeasurementHistory } from '../features/measurements/components/MeasurementHistory.tsx';
import { RecordMeasurementForm } from '../features/measurements/components/RecordMeasurementForm.tsx';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: detail, isLoading, isError } = useOrderDetail(id!);
  const { data: garments, isLoading: isLoadingGarments } = useOrderGarments(id!);
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);

  useEffect(() => {
    if (garments && garments.length > 0 && !selectedGarmentId) {
      setSelectedGarmentId(garments[0].id);
    }
  }, [garments, selectedGarmentId]);

  if (isLoading || isLoadingGarments) return <div className="sf-loading-overlay sf-glass">Syncing Production Context...</div>;
  if (isError || !detail) return <div className="container p-lg text-center"><h1>Order Not Found</h1><p>This production record does not exist or access is restricted.</p></div>;

  const { order, projection } = detail;

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
              <span className="font-bold">{order.customerName}</span>
            </div>
            <div className="border-l border-sf-border pl-md">
              <span className="text-muted text-xs block">Event Date</span>
              <span className="font-bold">{new Date(order.eventDate).toLocaleDateString()}</span>
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
                  <span className={selectedGarmentId === garment.id ? 'font-bold' : ''}>
                    {garment.name}
                  </span>
                  <span className="text-xs text-muted uppercase">{garment.status}</span>
                </button>
              ))}
            </div>
          </div>
          
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
