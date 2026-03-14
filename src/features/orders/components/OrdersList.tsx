import { useOrders } from '../hooks/useOrders.ts';
import { WorkshopTable } from '../../../components/ui/WorkshopTable.tsx';
import { RiskBadge } from '../../../components/ui/RiskBadge.tsx';

export function OrdersList() {
  const { data: orders, isLoading, isError } = useOrders();

  if (isLoading) return <div>Synchronizing Order Ledger...</div>;
  if (isError) return <div>Failed to load orders.</div>;

  return (
    <WorkshopTable headers={['Order #', 'Customer', 'Garment', 'Deadline', 'Risk State']}>
      {orders?.map(order => (
        <tr key={order.id}>
          <td><span className="font-bold">{order.orderNumber}</span></td>
          <td>{order.customerName}</td>
          <td>{order.garmentName}</td>
          <td><span className="deadline-dominant" style={{ fontSize: '1rem' }}>{order.deadline}</span></td>
          <td><RiskBadge level={order.riskLevel} /></td>
        </tr>
      ))}
    </WorkshopTable>
  );
}
