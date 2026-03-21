import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../store';
import { useMe } from '../../features/auth/hooks/useAuth';

export function ProtectedLayout() {
  const { data: user, isLoading, isError } = useMe();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const location = useLocation();

  if (isLoading) {
    return <div className="sf-loading-overlay sf-glass">Syncing Production OS...</div>;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Orders', path: '/orders', icon: '📦' },
  ];

  if (user.role === 'COMPANY_ADMIN') {
    navItems.push({ label: 'Staff', path: '/staff', icon: '👥' });
  }

  return (
    <div className={`protected-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="sf-sidebar sf-glass flex flex-col p-md">
        <div className="sidebar-header mb-xl px-md">
          <h2 className="text-h2 font-bold tracking-tight">StitchFlow</h2>
        </div>
        
        <nav className="flex-1 flex flex-col gap-sm">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link flex items-center gap-md p-md rounded-lg transition-all ${
                location.pathname === item.path 
                  ? 'bg-primary text-white shadow-md' 
                  : 'hover:bg-muted text-muted hover:text-foreground'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer mt-auto p-md sf-glass rounded-lg border border-sf-border shadow-inner">
          <div className="text-xs text-muted uppercase font-bold mb-xs">Authenticated</div>
          <div className="font-bold text-sm truncate">{user.email}</div>
          <div className="text-[10px] text-muted uppercase">{user.role.replace('_', ' ')}</div>
        </div>
      </aside>
      
      <main className="sf-main-content">
        <header className="sf-header sf-glass flex items-center justify-between px-lg">
          <div className="text-muted text-sm font-medium">Production Environment / {navItems.find(i => i.path === location.pathname)?.label || 'Record'}</div>
        </header>
        <section className="sf-page-container">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
