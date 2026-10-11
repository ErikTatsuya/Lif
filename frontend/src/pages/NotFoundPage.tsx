import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="state-page">
      <h1>Página não encontrada</h1>
      <Link className="auth-link" to="/">Voltar ao início</Link>
    </main>
  );
}
