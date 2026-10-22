import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RequireAuth() {
  const { profile, loading, error, refresh } = useAuth();
  const location = useLocation();

  if (loading) {
    return <main className="state-page" role="status">Verificando sua sessão...</main>;
  }

  if (error) {
    return (
      <main className="state-page">
        <p className="auth-message" role="alert">{error}</p>
        <button className="submit-button state-retry" type="button" onClick={() => void refresh()}>
          Tentar novamente
        </button>
      </main>
    );
  }

  if (!profile) {
    const next = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return <Outlet />;
}
