import { CapacityBanner } from '../features/orders/components/CapacityBanner.tsx';
import { OrdersList } from '../features/orders/components/OrdersList.tsx';
import { UrgentGarments } from '../features/orders/components/UrgentGarments.tsx';

export function OrdersPage() {
  return (
    <div className="orders-page container">
      <header className="mb-lg flex justify-between items-end">
        <div>
          <h1 className="text-h1">Deadline Operating System</h1>
          <p className="text-secondary">High-fidelity projection of workshop workload risk</p>
        </div>
        <div className="text-right">
          <span className="badge badge-primary">LIVE LEDGER</span>
        </div>
      </header>

      <CapacityBanner />

      <UrgentGarments />

      <section className="sf-card" style={{ padding: 'var(--space-lg)' }}>
        <OrdersList />
      </section>
    </div>
  );
}
