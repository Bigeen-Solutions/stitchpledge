import { Outlet } from 'react-router-dom';

export function CustomerPortalLayout() {
  return (
    <div className="customer-portal min-h-screen sf-bg-workshop">
      <nav className="sf-glass-nav flex justify-between items-center p-md mb-xl shadow-sm">
        <div className="flex items-center gap-md">
          <div className="sf-logo-badge">SF</div>
          <span className="text-h3 font-bold">Stitchfyn Portal</span>
        </div>
        <div className="flex items-center gap-lg">
          <span className="text-sm font-bold text-muted uppercase tracking-widest">Customer Access</span>
        </div>
      </nav>
      
      <main className="container pb-xl">
        <Outlet />
      </main>

      <footer className="container py-lg border-t border-glass text-center">
        <p className="text-xs text-muted">© 2026 Stitchfyn Workshop Engine. Secure Read-Only Projection.</p>
      </footer>
    </div>
  );
}
