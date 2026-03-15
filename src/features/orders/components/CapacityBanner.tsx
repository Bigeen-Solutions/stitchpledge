import { useCapacityWarning } from '../hooks/useOrders.ts';

export function CapacityBanner() {
  const { data: capacity, isLoading } = useCapacityWarning();

  if (isLoading) return (
    <div className="skeleton-loader" style={{ height: '80px', marginBottom: 'var(--space-lg)', borderRadius: 'var(--radius-card)' }}></div>
  );

  const isCritical = capacity?.isOverCapacity;

  return (
    <div className={`sf-card capacity-indicator ${isCritical ? 'critical' : 'healthy'}`} style={{ 
      background: isCritical 
        ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(220, 38, 38, 0.03) 100%)' 
        : 'linear-gradient(135deg, rgba(22, 163, 74, 0.08) 0%, rgba(22, 163, 74, 0.03) 100%)',
      border: `1px solid ${isCritical ? 'var(--risk-overdue)' : 'var(--risk-ontrack)'}`,
      borderLeftWidth: '6px',
      marginBottom: 'var(--space-lg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-md) var(--space-lg)',
      backdropFilter: 'blur(8px)',
    }}>
      <div className="flex items-center gap-lg">
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: isCritical ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.1)',
          color: isCritical ? 'var(--risk-overdue)' : 'var(--risk-ontrack)',
          fontSize: '1.5rem'
        }}>
          {isCritical ? '⚠️' : '⚡'}
        </div>
        <div>
          <div className="flex items-center gap-sm">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: isCritical ? 'var(--risk-overdue)' : 'var(--risk-ontrack)' }}>
              Workshop Capacity Status
            </span>
            <div className={`badge ${isCritical ? 'badge-overdue' : 'badge-ontrack'}`}>
              {isCritical ? 'AT CAPACITY' : 'STABLE'}
            </div>
          </div>
          <p className="text-lg font-bold" style={{ color: 'var(--color-primary)', marginTop: 'var(--space-xs)' }}>
            {capacity?.message || 'Workshop is operating within safe capacity limits.'}
          </p>
        </div>
      </div>

      <div className="text-right">
        <div className={`badge ${isCritical ? 'badge-overdue' : 'badge-ontrack'}`} style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: '0.75rem' }}>
          {isCritical ? '⚠️ HIGH RISK' : '✅ STABLE'}
        </div>
      </div>

      <style>{`
        .capacity-indicator {
          transition: all 0.3s ease;
        }
        .critical {
          box-shadow: 0 4px 20px -5px rgba(220, 38, 38, 0.2);
        }
      `}</style>
    </div>
  );
}
