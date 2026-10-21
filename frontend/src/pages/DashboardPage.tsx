import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import person from '../assets/person.svg';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { Sidebar } from '../components/Sidebar';
import { ApiError, authApi, type Profile } from '../lib/api';

const projects = [
  {
    id: 'qlete',
    name: 'Qlete',
    status: 'Em desenvolvimento',
    description: 'Projeto Qlete integrado ao Lif.',
  },
];

export function DashboardPage() {
  const profile = useOutletContext<Profile>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutConfirmation, setLogoutConfirmation] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileMenu = useRef<HTMLDivElement>(null);
  const showingProjects = searchParams.get('view') === 'projects';

  function resetLogout() {
    setLogoutConfirmation(false);
    setLogoutMessage('');
  }

  function closeProfile() {
    setProfileOpen(false);
    resetLogout();
  }

  useEffect(() => {
    document.title = 'Dashboard | Lif';
    function handleOutsideClick(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        profileMenu.current &&
        !profileMenu.current.contains(event.target)
      ) {
        setProfileOpen(false);
        setLogoutConfirmation(false);
        setLogoutMessage('');
      }
    }

    window.addEventListener('pointerdown', handleOutsideClick);
    return () => window.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutMessage('');
    try {
      await authApi.logout();
      navigate('/', { replace: true });
    } catch (cause) {
      console.error('Erro ao sair da conta:', cause);
      setLogoutMessage(
        cause instanceof ApiError ? cause.message : 'Não foi possível sair da conta.'
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="topbar dashboard-topbar">
          <div className="profile-menu" ref={profileMenu}>
            <button
              className="profile-button"
              type="button"
              aria-label="Mostrar informações do perfil"
              aria-expanded={profileOpen}
              aria-controls="profile-panel"
              onClick={() => {
                setProfileOpen((isOpen) => !isOpen);
                resetLogout();
              }}
            >
              <img src={person} alt="" />
            </button>

            {profileOpen && (
              <section className="profile-panel" id="profile-panel" aria-label="Informações do perfil">
                <div className="panel-heading">
                  <h2>Perfil</h2>
                  <button
                    className="close-button"
                    type="button"
                    aria-label="Fechar perfil"
                    onClick={closeProfile}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <dl>
                  <div>
                    <dt>Nome</dt>
                    <dd>{profile.name}</dd>
                  </div>
                  <div>
                    <dt>Nome de usuário</dt>
                    <dd>@{profile.username}</dd>
                  </div>
                  <div>
                    <dt>E-mail</dt>
                    <dd>{profile.email}</dd>
                  </div>
                </dl>

                {logoutConfirmation ? (
                  <div className="logout-confirmation">
                    <p>Tem certeza que deseja sair da conta?</p>
                    {logoutMessage && <p className="auth-message" role="alert">{logoutMessage}</p>}
                    <button
                      className="confirm-logout-button"
                      type="button"
                      onClick={() => void handleLogout()}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? 'Saindo...' : 'Sim, sair da conta'}
                    </button>
                    <button
                      className="cancel-logout-button"
                      type="button"
                      onClick={resetLogout}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    className="logout-button"
                    type="button"
                    onClick={() => setLogoutConfirmation(true)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M10 17l5-5-5-5m5 5H3m9-9h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
                    </svg>
                    Sair da conta
                  </button>
                )}
              </section>
            )}
          </div>
        </header>

        <section className="dashboard-content">
          {showingProjects ? (
            <>
              <h1>Projetos</h1>
              <div className="project-grid">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    className="project-card"
                    to={`/projects/${project.id}`}
                  >
                    <span className="project-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" rx="3" />
                        <path d="M8 9h8M8 13h5" />
                      </svg>
                    </span>
                    <span className="project-details">
                      <strong>{project.name}</strong>
                      <span>{project.status}</span>
                      <span>{project.description}</span>
                    </span>
                    <svg className="open-project" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <h1>Dashboard</h1>
          )}
        </section>

        <DecorativeBackground />
      </main>
    </div>
  );
}