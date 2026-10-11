import { useEffect, type ReactNode } from 'react';
import { Brand } from './Brand';
import { DecorativeBackground } from './DecorativeBackground';

type AuthShellProps = {
  title: string;
  children: ReactNode;
};

export function AuthShell({ title, children }: AuthShellProps) {
  useEffect(() => {
    document.title = `${title} | Lif`;
  }, [title]);

  return (
    <main className="auth-page">
      <header className="topbar">
        <Brand />
      </header>
      <DecorativeBackground />
      <section className="auth-card" aria-labelledby="auth-title">
        <h1 id="auth-title">{title}</h1>
        {children}
      </section>
    </main>
  );
}
