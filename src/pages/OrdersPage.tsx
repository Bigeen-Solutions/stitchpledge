import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { CapacityBanner } from '../features/orders/components/CapacityBanner.tsx';
import { OrdersList } from '../features/orders/components/OrdersList.tsx';
import { UrgentGarments } from '../features/orders/components/UrgentGarments.tsx';
import '../features/orders/styles/orders.css';

export function OrdersPage() {
  const navigate = useNavigate();

  return (
    <div className="orders-page container">
      <header className="mb-lg flex flex-col md:flex-row md:justify-between md:items-end gap-sm md:gap-0">
        <div>
          <h1 className="text-h1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', lineHeight: 1.2 }}>Deadline Operating System</h1>
          <p className="text-black text-sm md:text-base mt-xs">High-fidelity projection of workshop workload risk</p>
        </div>
        <div className="text-left md:text-right mt-sm md:mt-0">
          <span className="badge badge-primary">LIVE LEDGER</span>
        </div>
      </header>

      <CapacityBanner />

      <UrgentGarments />

      <section className="sf-card" style={{ padding: 'var(--space-lg)' }}>
        <OrdersList />
      </section>

      {/* Floating Action Button - Mobile Only */}
      <div className="fab-container desktop-hide">
        <div className="fab-main" onClick={() => navigate('/orders/new')}>
          <AddIcon />
        </div>
      </div>
    </div>
  );
}
