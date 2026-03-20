// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';
import { mapErrorCode } from '../utils/errorMapper';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  // const { setAccessToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      console.log('Login response:', data)
      localStorage.setItem('access_token', data.accessToken)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
      console.log('Token stored:', localStorage.getItem('access_token'))
      navigate('/dashboard')
    } catch (err: any) {
      if (!err.response) {
  setError('Network error. Please check your connection.')
  return
}
const code = err.response.data?.code
setError(mapErrorCode(code))
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card sf-glass">
        <h1>StitchFlow</h1>
        <p className="subtitle">Production Operating System</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="workshop@stitchflow.io"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
