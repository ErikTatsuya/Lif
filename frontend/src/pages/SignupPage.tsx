import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { ApiError, authApi } from '../lib/api';

export function SignupPage() {
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: String(formData.get('name') ?? '').trim(),
      username: String(formData.get('username') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      password: String(formData.get('password') ?? '')
    };

    if (!data.name || !data.username || !data.email || !data.password) {
      setMessage('Preencha todos os campos.');
      setIsSubmitting(false);
      return;
    }

    try {
      await authApi.signup(data);
      setIsSuccess(true);
      setMessage('Conta criada. Agora você pode entrar.');
    } catch (cause) {
      console.error('Erro no cadastro:', cause);
      setMessage(
        cause instanceof ApiError
          ? cause.message
          : 'Não foi possível criar a conta. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Criar conta">
      {isSuccess ? (
        <>
          <p className="auth-message success" role="status">{message}</p>
          <p className="auth-switch">
            <Link className="auth-link" to="/login">Ir para login</Link>
          </p>
        </>
      ) : (
        <>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              Nome
              <input className="auth-input" name="name" type="text" autoComplete="name" required />
            </label>

            <label className="auth-field">
              Nome de usuário
              <input
                className="auth-input"
                name="username"
                type="text"
                autoComplete="username"
                required
              />
            </label>

            <label className="auth-field">
              E-mail
              <input className="auth-input" name="email" type="email" autoComplete="email" required />
            </label>

            <label className="auth-field">
              Senha
              <input
                className="auth-input"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={255}
                required
              />
            </label>

            {message && (
              <p className="auth-message" role="alert">
                {message}
              </p>
            )}
            <button className="submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="auth-switch">
            Já tem uma conta? <Link className="auth-link" to="/login">Entrar</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
