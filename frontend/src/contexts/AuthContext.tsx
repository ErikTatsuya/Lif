import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { ApiError, authApi, type Profile } from '../lib/api';

type AuthContextValue = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await authApi.getCurrentUser());
    } catch (cause) {
      console.error('Erro ao verificar a sessão:', cause);
      setError(
        cause instanceof ApiError
          ? cause.message
          : 'Não foi possível verificar sua sessão. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ profile, loading, error, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
