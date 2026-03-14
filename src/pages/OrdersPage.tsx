import { CapacityBanner } from '../features/orders/components/CapacityBanner.tsx';
import { OrdersList } from '../features/orders/components/OrdersList.tsx';

export function OrdersPage() {
  return (
    <div className="orders-page container">
      <header className="mb-lg">
        <h1 className="text-h1">Production Orders</h1>
        <p className="text-muted">Direct projection from the workshop ledger</p>
      </header>

      <CapacityBanner />

      <section className="sf-card">
        <OrdersList />
      </section>
    </div>
  );
}
