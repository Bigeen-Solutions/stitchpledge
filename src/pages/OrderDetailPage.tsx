import { useParams } from 'react-router-dom';
import { useOrderDetail } from '../features/orders/hooks/useOrderDetail.ts';
import { DeadlineCard } from '../components/ui/DeadlineCard.tsx';
import { WorkflowStages } from '../features/workflow/components/WorkflowStages.tsx';
import { MaterialHistory } from '../features/materials/components/MaterialHistory.tsx';
import { MeasurementHistory } from '../features/measurements/components/MeasurementHistory.tsx';
import { RecordMeasurementForm } from '../features/measurements/components/RecordMeasurementForm.tsx';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrderDetail(id!);

  if (isLoading) return <div className="sf-loading-overlay sf-glass">Syncing Production Context...</div>;
  if (isError || !order) return <div className="container p-lg text-center"><h1>Order Not Found</h1><p>This production record does not exist or access is restricted.</p></div>;

  return (
    <div className="order-detail-page container">
      <header className="mb-lg flex justify-between items-center">
        <div>
          <h1 className="text-h1">Production Record: {order.orderNumber}</h1>
          <p className="text-muted">High-fidelity projection for {order.customerName}</p>
        </div>
        <div className="badge badge-ontrack">{order.status}</div>
      </header>

      <div className="grid grid-cols-3 mb-xl">
        <div className="col-span-1 grid gap-lg">
          <DeadlineCard 
            orderId={order.orderNumber} 
            deadline={order.deadline} 
            riskLevel={order.riskLevel} 
            customer={order.customerName} 
          />
          <RecordMeasurementForm orderId={order.id} />
        </div>
        <div className="col-span-2">
          <WorkflowStages orderId={order.id} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-xl">
        <div className="sf-card">
          <MaterialHistory orderId={order.id} />
        </div>
        <div className="sf-card">
          <MeasurementHistory orderId={order.id} />
        </div>
      </div>
    </div>
  );
}
