import { useOrders } from '../hooks/useOrders.ts';
import { WorkshopTable } from '../../../components/ui/WorkshopTable.tsx';
import { RiskBadge } from '../../../components/ui/RiskBadge.tsx';

export function OrdersList() {
  const { data: orders, isLoading, isError } = useOrders();

  if (isLoading) return <div>Synchronizing Order Ledger...</div>;
  if (isError) return <div>Failed to load orders.</div>;

  return (
    <div className="orders-ledger">
      <div className="flex justify-between items-center mb-md px-md">
        <h2 className="text-h2">Production Ledger</h2>
        <div className="text-sm text-muted">Showing all active workshop projections</div>
      </div>
      
      <WorkshopTable headers={['Order #', 'Customer', 'Garment', 'Deadline', 'Risk State']}>
        {orders?.map(order => (
          <tr key={order.id} className={`ledger-row risk-${order.riskLevel.toLowerCase()}`}>
            <td>
              <div className="font-bold">{order.orderNumber}</div>
              <div className="text-xs text-muted">{order.status}</div>
            </td>
            <td>{order.customerName}</td>
            <td>{order.garmentName}</td>
            <td>
              <div className="deadline-dominant" style={{ 
                fontSize: '1.25rem', 
                fontWeight: 800,
                color: order.riskLevel === 'OVERDUE' ? 'var(--risk-overdue)' : 'inherit'
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
