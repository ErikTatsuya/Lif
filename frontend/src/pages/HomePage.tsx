import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { ApiError, eventApi, type DailyEvent } from '../lib/api';

type EventState =
  | { status: 'loading' }
  | { status: 'ready'; event: DailyEvent | null; message: string | null }
  | { status: 'error'; message: string };

export function HomePage() {
  const navigate = useNavigate();
  const [eventState, setEventState] = useState<EventState>({ status: 'loading' });
  const today = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  useEffect(() => {
    document.title = 'Lif';
    let active = true;

    void eventApi
      .getTodaysEvent()
      .then((event) => {
        if (!active) return;
        setEventState({
          status: 'ready',
          event,
          message: event ? null : 'Ainda não há um dado cadastrado para hoje.'
        });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        console.error('Erro ao carregar o dado diário:', cause);
        setEventState({
          status: 'error',
          message:
            cause instanceof ApiError
              ? cause.message
              : 'Não foi possível carregar o dado diário.'
        });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="home-page">
      <header className="home-topbar">
        <Brand label="Lif" />
        <nav aria-label="Navegação principal">
          <button className="dashboard" type="button" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="login" type="button" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="signup" type="button" onClick={() => navigate('/signup')}>
            Sign up
          </button>
        </nav>
      </header>

      <section className="daily-event" aria-labelledby="daily-event-title">
        <p className="eyebrow">Lif · Dado diário</p>
        <h1 id="daily-event-title">Aconteceu neste dia</h1>
        <p className="date">{today}</p>

        {eventState.status === 'loading' ? (
          <p className="event-message" role="status">
            Carregando o dado diário...
          </p>
        ) : eventState.status === 'ready' && eventState.event ? (
          <article className="event-card">
            <p className="event-year">{eventState.event.year}</p>
            <h2>{eventState.event.title}</h2>
            <p className="event-description">{eventState.event.description}</p>
          </article>
        ) : (
          <p className="event-message" role={eventState.status === 'error' ? 'alert' : 'status'}>
            {eventState.message}
          </p>
        )}
      </section>

      <DecorativeBackground />
    </main>
  );
}
