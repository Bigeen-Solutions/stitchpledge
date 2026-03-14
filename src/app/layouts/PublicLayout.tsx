import { Outlet, Navigate } from 'react-router-dom';

export function PublicLayout() {
  const isAuthenticated = !!localStorage.getItem('access_token');
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="public-layout">
      <Outlet />
    </main>
  );
}
