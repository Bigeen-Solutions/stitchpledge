import { useUrgentGarments } from '../hooks/useUrgentGarments.ts';
import { useNavigate } from 'react-router-dom';
import { RiskBadge } from '../../../components/ui/RiskBadge.tsx';

export function UrgentGarments() {
  const navigate = useNavigate();
  const { data: urgentGarments, isLoading } = useUrgentGarments();

  if (isLoading) return null;

  if (!urgentGarments || urgentGarments.length === 0) return null;

  return (
    <section className="mb-lg">
      <div className="urgent-header flex justify-between items-center mb-md">
        <h2 className="text-h2" style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span className="pulse-dot"></span>
          High-Risk Production Focus
        </h2>
        <span className="text-sm font-medium text-muted">{urgentGarments.length} garments requiring attention</span>
      </div>
      
      <div className="urgent-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: 'var(--space-md)' 
      }}>
        {urgentGarments.map(garment => (
          <div key={garment.garmentId} className="sf-card urgent-card" style={{
            borderLeft: `4px solid var(--risk-${garment.riskLevel.toLowerCase()})`,
            padding: 'var(--space-md)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="flex justify-between items-start mb-sm">
              <div>
                <span className="text-xs font-bold text-muted uppercase tracking-wider">Order #{garment.orderNumber}</span>
                <h3 className="text-lg font-bold" style={{ marginTop: 'var(--space-xs)' }}>{garment.garmentName}</h3>
              </div>
              <RiskBadge level={garment.riskLevel} />
            </div>
            
            <div className="urgent-card-footer mt-md flex justify-between items-end">
              <div>
                <p className="text-sm text-secondary">{garment.customerName}</p>
                <div className="deadline-dominant" style={{ fontSize: '1.25rem', marginTop: 'var(--space-xs)' }}>
                  {new Date(garment.eventDate).toLocaleDateString()}
                </div>
              </div>
              <button 
                className="text-button urgent-start-btn" 
                style={{ fontWeight: 700 }}
                onClick={() => navigate(`/orders/${garment.orderId}`, { state: { targetGarmentId: garment.garmentId } })}
              >
                START NOW →
              </button>
            </div>

            {garment.riskLevel === 'OVERDUE' && (
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

        @media (max-width: 768px) {
          .urgent-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: var(--space-sm);
          }
          .urgent-grid {
            grid-template-columns: 1fr !important;
          }
          .urgent-card-footer {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: var(--space-sm);
          }
          .urgent-start-btn {
            font-size: 0.75rem !important;
            align-self: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
