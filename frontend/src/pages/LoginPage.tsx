import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { ApiError, authApi } from '../lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);
  const [sessionCheckMessage, setSessionCheckMessage] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    void authApi
      .getCurrentUser()
      .then((profile) => {
        if (active && profile) setIsAlreadyLoggedIn(true);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        console.error('Erro ao verificar a sessão:', cause);
        setSessionCheckMessage(
          cause instanceof ApiError
            ? cause.message
            : 'Não foi possível verificar sua sessão.'
        );
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get('identifier') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!identifier || !password) {
      setMessage('Preencha usuário/e-mail e senha.');
      setIsSubmitting(false);
      return;
    }

    try {
      await authApi.login(identifier, password);
      navigate('/dashboard', { replace: true });
    } catch (cause) {
      console.error('Erro no login:', cause);
      setMessage(
        cause instanceof ApiError
          ? cause.message
          : 'Não foi possível entrar. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Login">
      {isAlreadyLoggedIn && (
        <p className="auth-message success" role="status">
          Você já está logado. <Link className="auth-link" to="/dashboard">Ir para o dashboard</Link>
        </p>
      )}
      {sessionCheckMessage && (
        <p className="auth-message" role="alert">
          {sessionCheckMessage}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          Usuário ou e-mail
          <input
            className="auth-input"
            name="identifier"
            type="text"
            autoComplete="username"
            required
          />
        </label>

        <label className="auth-field">
          Senha
          <input
            className="auth-input"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {message && (
          <p className="auth-message" role="alert">
            {message}
          </p>
        )}
        <button className="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="auth-switch">
        Ainda não tem conta? <Link className="auth-link" to="/signup">Criar conta</Link>
      </p>
    </AuthShell>
  );
}
