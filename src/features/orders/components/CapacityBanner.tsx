import { useCapacityWarning } from '../hooks/useOrders.ts';

export function CapacityBanner() {
  const { data: capacity, isLoading } = useCapacityWarning();

  if (isLoading || !capacity?.isOverCapacity) return null;

  return (
    <div className="sf-card" style={{ 
      backgroundColor: 'rgba(220, 38, 38, 0.05)', 
      border: '1px solid var(--risk-overdue)',
      marginBottom: 'var(--space-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-md)'
    }}>
      <div className="badge badge-overdue">CAPACITY WARNING</div>
      <p className="text-sm font-bold" style={{ color: 'var(--risk-overdue)' }}>
        {capacity.message}
      </p>
    </div>
  );
}
