import { Outlet, Navigate } from 'react-router-dom';
import { useUIStore } from '../store';
import { useMe } from '../../features/auth/hooks/useAuth';

export function ProtectedLayout() {
  const { data: user, isLoading, isError } = useMe();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  if (isLoading) {
    return <div className="sf-loading-overlay sf-glass">Syncing Production OS...</div>;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`protected-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="sf-sidebar sf-glass">
        {/* Sidebar content will go here */}
        <div className="sidebar-header">
          <h2>StitchFlow</h2>
        </div>
      </aside>
      
      <main className="sf-main-content">
        <header className="sf-header sf-glass">
          {/* Header content will go here */}
        </header>
        <section className="sf-page-container">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
