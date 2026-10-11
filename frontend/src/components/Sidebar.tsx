import { Link, useSearchParams } from 'react-router-dom';
import { Brand } from './Brand';

export function Sidebar() {
  const [searchParams] = useSearchParams();
  const showingProjects = searchParams.get('view') === 'projects';

  return (
    <aside className="sidebar">
      <Brand label="Lif" variant="sidebar" />
      <nav aria-label="Navegação principal">
        <Link
          to="/dashboard"
          className={!showingProjects ? 'active' : ''}
          aria-current={!showingProjects ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" />
          </svg>
          Dashboard
        </Link>
        <Link
          to="/dashboard?view=projects"
          className={showingProjects ? 'active' : ''}
          aria-current={showingProjects ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="8" height="7" rx="1.5" />
            <rect x="13" y="4" width="8" height="7" rx="1.5" />
            <rect x="3" y="13" width="8" height="7" rx="1.5" />
            <rect x="13" y="13" width="8" height="7" rx="1.5" />
          </svg>
          Projetos
        </Link>
      </nav>
    </aside>
  );
}
