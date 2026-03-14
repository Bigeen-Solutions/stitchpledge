import { useMe, useLogout } from '../../auth/hooks/useAuth';

export function WelcomePanel() {
  const { data: user } = useMe();
  const logout = useLogout();

  if (!user) return null;

  return (
    <div className="welcome-panel card sf-glass">
      <div className="welcome-content">
        <h1>Welcome back, {user.name}</h1>
        <p className="active-store">
          Active Store: <strong>{user.activeStore?.name || 'No Store Selected'}</strong>
        </p>
      </div>
      <button 
        onClick={() => logout.mutate()} 
        className="text-button"
        disabled={logout.isPending}
      >
        {logout.isPending ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  );
}
