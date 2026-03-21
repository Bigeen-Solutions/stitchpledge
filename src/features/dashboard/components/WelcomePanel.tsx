import { useAuthStore } from '../../auth/auth.store';
import { useLogout } from '../../auth/hooks/useAuth';

export function WelcomePanel() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  if (!user) return null;

  return (
    <div className="welcome-panel card sf-glass">
      <div className="welcome-content">
        <h1>Welcome back, {user.fullName}</h1>
        <p className="active-store">
          Role: <strong>{user.role.replace('_', ' ')}</strong>
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
