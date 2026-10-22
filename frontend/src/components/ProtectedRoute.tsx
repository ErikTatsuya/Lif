import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const location = useLocation();
  const { profile, loading, error, refresh } = useAuth();

  if (loading) {
    return (
      <main className="state-page" role="status">
        Verificando sua sessão...
      </main>
    );
  }

  if (!error && !profile) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (error) {
    return (
      <main className="state-page">
        <p className="auth-message" role="alert">
          {error}
        </p>
        <button
          className="submit-button state-retry"
          onClick={() => void refresh()}
        >
          Tentar novamente
        </button>
      </main>
    );
  }

  return <Outlet context={profile} />;
}
