import { useOrders } from '../hooks/useOrders.ts';
import { WorkshopTable } from '../../../components/ui/WorkshopTable.tsx';
import { RiskBadge } from '../../../components/ui/RiskBadge.tsx';
import { WorkshopTableSkeleton } from '../../../components/ui/WorkshopTableSkeleton.tsx';
import { ErrorState } from '../../../components/feedback/ErrorState.tsx';

export function OrdersList() {
  const { data: orders, isLoading, isError, error, refetch } = useOrders();

  if (isLoading) {
    return (
      <div className="orders-ledger">
        <div className="flex justify-between items-center mb-md px-md">
          <h2 className="text-h2">Active Order Overview</h2>
          <div className="text-sm text-black">Synchronizing Order Ledger...</div>
        </div>
        <WorkshopTableSkeleton headers={['Order #', 'Customer', 'Garment', 'Deadline', 'Risk State']} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState 
        error={error} 
        onRetry={() => refetch()} 
        title="Ledger Synchronization Failed"
      />
    );
  }

  return (
    <div className="orders-ledger">
      <div className="flex justify-between items-center mb-md px-md">
        <h2 className="text-h2">Active Order Overview</h2>
        <div className="text-sm text-black">Showing all active workshop projections</div>
      </div>
      
      <WorkshopTable headers={['Order #', 'Customer', 'Garment', 'Deadline', 'Risk State']}>
        {orders?.items?.map(order => (
          <tr key={order.garmentId} className={`ledger-row risk-${order.riskLevel.toLowerCase()}`}>
            <td>
              <div className="font-bold text-black" style={{ fontSize: '1rem' }}>{order.orderNumber}</div>
              <div className="text-xs text-black uppercase font-bold opacity-70">{order.status}</div>
            </td>
            <td className="text-black font-medium">{order.customerName}</td>
            <td className="text-black">{order.garmentName}</td>
            <td>
              <div className="deadline-dominant" style={{ 
                fontSize: '1.25rem', 
                fontWeight: 800,
                color: order.riskLevel === 'OVERDUE' ? 'var(--risk-overdue)' : 'var(--color-text-primary)'
              }}>
                {order.deadline}
              </div>
            </td>
            <td><RiskBadge level={order.riskLevel} /></td>
          </tr>
        ))}
      </WorkshopTable>

      <style>{`
        .ledger-row {
          transition: background-color 0.2s ease;
        }
        .ledger-row.risk-overdue {
          background-color: rgba(220, 38, 38, 0.02);
        }
        .ledger-row.risk-atrisk {
          background-color: rgba(245, 158, 11, 0.02);
        }
        .ledger-row:hover {
          background-color: var(--color-bg) !important;
        }
        .deadline-dominant {
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}
