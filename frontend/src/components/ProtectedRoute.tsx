import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ApiError, authApi, type Profile } from '../lib/api';

type SessionState =
  | { status: 'loading' }
  | { status: 'authenticated'; profile: Profile }
  | { status: 'unauthenticated' }
  | { status: 'error'; message: string };

export function ProtectedRoute() {
  const location = useLocation();
  const [session, setSession] = useState<SessionState>({ status: 'loading' });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setSession({ status: 'loading' });

    void authApi
      .getCurrentUser()
      .then((profile) => {
        if (!active) return;
        setSession(profile ? { status: 'authenticated', profile } : { status: 'unauthenticated' });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        const message =
          cause instanceof ApiError
            ? cause.message
            : 'Não foi possível verificar sua sessão. Tente novamente.';
        console.error('Erro ao verificar a sessão:', cause);
        setSession({ status: 'error', message });
      });

    return () => {
      active = false;
    };
  }, [location.pathname, retryCount]);

  if (session.status === 'loading') {
    return (
      <main className="state-page" role="status">
        Verificando sua sessão...
      </main>
    );
  }

  if (session.status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (session.status === 'error') {
    return (
      <main className="state-page">
        <p className="auth-message" role="alert">
          {session.message}
        </p>
        <button
          className="submit-button state-retry"
          onClick={() => setRetryCount((count) => count + 1)}
        >
          Tentar novamente
        </button>
      </main>
    );
  }

  return <Outlet context={session.profile} />;
}
