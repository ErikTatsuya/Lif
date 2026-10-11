import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { Sidebar } from '../components/Sidebar';

export function QletePage() {
  useEffect(() => {
    document.title = 'Qlete | Lif';
  }, []);

  return (
    <div className="projects-shell">
      <Sidebar />
      <main className="projects-main">
        <section className="qlete-page" aria-labelledby="qlete-heading">
          <Link className="back-link" to="/dashboard?view=projects">Projetos</Link>
          <h1 id="qlete-heading">Qlete</h1>
          <p>Este projeto será integrado ao Lif.</p>
          <span className="status">Em desenvolvimento</span>
        </section>
        <DecorativeBackground />
      </main>
    </div>
  );
}
