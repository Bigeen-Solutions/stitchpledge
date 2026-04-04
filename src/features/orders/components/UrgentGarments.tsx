import { useOrders } from '../hooks/useOrders.ts';
import { RiskBadge } from '../../../components/ui/RiskBadge.tsx';

export function UrgentGarments() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) return null;

  const urgentOrders = orders?.items?.filter(o => o.isUrgent);

  if (!urgentOrders || urgentOrders.length === 0) return null;

  return (
    <section className="mb-lg">
      <div className="flex justify-between items-center mb-md">
        <h2 className="text-h2" style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span className="pulse-dot"></span>
          High-Risk Production Focus
        </h2>
        <span className="text-sm font-medium text-muted">{urgentOrders.length} garments requiring attention</span>
      </div>
      
      <div className="urgent-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: 'var(--space-md)' 
      }}>
        {urgentOrders.map(order => (
          <div key={order.garmentId} className="sf-card urgent-card" style={{
            borderLeft: `4px solid var(--risk-${order.riskLevel.toLowerCase()})`,
            padding: 'var(--space-md)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="flex justify-between items-start mb-sm">
              <div>
                <span className="text-xs font-bold text-muted uppercase tracking-wider">{order.orderNumber}</span>
                <h3 className="text-lg font-bold" style={{ marginTop: 'var(--space-xs)' }}>{order.garmentName}</h3>
              </div>
              <RiskBadge level={order.riskLevel} />
            </div>
            
            <div className="mt-md flex justify-between items-end">
              <div>
                <p className="text-sm text-secondary">{order.customerName}</p>
                <div className="deadline-dominant" style={{ fontSize: '1.25rem', marginTop: 'var(--space-xs)' }}>
                  {order.deadline}
                </div>
              </div>
              <button className="text-button" style={{ fontWeight: 700 }}>START NOW →</button>
            </div>

            {order.riskLevel === 'OVERDUE' && (
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, transparent 50%, rgba(220, 38, 38, 0.05) 50%)',
                zIndex: -1
              }} />
            )}
          </div>
        ))}
      </div>

      <style>{`
        .pulse-dot {
          width: 12px;
          height: 12px;
          background-color: var(--color-danger);
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }

        .urgent-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          background: var(--color-surface);
        }

        .urgent-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </section>
  );
}
