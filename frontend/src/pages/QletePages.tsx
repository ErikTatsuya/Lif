import {
  useEffect,
  useReducer,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode
} from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { useAuth } from '../contexts/AuthContext';
import {
  ApiError,
  qleteApi,
  type EditableQuiz,
  type QuizAnswerCheck,
  type QuizLeaderboardEntry,
  type Quiz,
  type QuizResult,
  type QuizSummary
} from '../lib/api';

type PageState<T> =
  | { status: 'loading' }
  | { status: 'ready'; value: T }
  | { status: 'error'; message: string };

type QuizProgress = {
  answers: Record<string, string>;
  result: QuizResult | null;
  storageError: string | null;
};

function temporaryNameKey(quizId: string) {
  return `qlete:temporary-name:${quizId}`;
}

function readTemporaryName(quizId: string) {
  return localStorage.getItem(temporaryNameKey(quizId))?.trim() ?? '';
}

function saveTemporaryName(quizId: string, name: string) {
  localStorage.setItem(temporaryNameKey(quizId), name.trim());
}

type EditorOption = { key: string; text: string; isCorrect: boolean };
type EditorQuestion = {
  key: string;
  prompt: string;
  explanation: string;
  options: EditorOption[];
};
type EditorState = {
  title: string;
  description: string;
  questions: EditorQuestion[];
};
type EditorAction =
  | { type: 'load'; quiz: EditableQuiz }
  | { type: 'set-title'; value: string }
  | { type: 'set-description'; value: string }
  | { type: 'set-question'; key: string; field: 'prompt' | 'explanation'; value: string }
  | { type: 'set-option'; questionKey: string; optionKey: string; value: string }
  | { type: 'add-question'; question: EditorQuestion }
  | { type: 'remove-question'; key: string }
  | { type: 'add-option'; questionKey: string; option: EditorOption }
  | { type: 'remove-option'; questionKey: string; optionKey: string }
  | { type: 'mark-correct'; questionKey: string; optionKey: string };

function newEditorQuestion(): EditorQuestion {
  const firstOptionKey = crypto.randomUUID();
  return {
    key: crypto.randomUUID(),
    prompt: '',
    explanation: '',
    options: [
      { key: firstOptionKey, text: '', isCorrect: true },
      { key: crypto.randomUUID(), text: '', isCorrect: false }
    ]
  };
}

function newEditorState(): EditorState {
  return { title: '', description: '', questions: [newEditorQuestion()] };
}

function shuffleOptions(quiz: Quiz): Quiz {
  return {
    ...quiz,
    questions: quiz.questions.map((question) => {
      const options = [...question.options];
      for (let index = options.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [options[index], options[randomIndex]] = [options[randomIndex], options[index]];
      }
      return { ...question, options };
    })
  };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  if (action.type === 'load') {
    return {
      title: action.quiz.title,
      description: action.quiz.description,
      questions: action.quiz.questions.map((question) => ({
        key: String(question.id),
        prompt: question.prompt,
        explanation: question.explanation ?? '',
        options: question.options.map((option) => ({
          key: String(option.id),
          text: option.text,
          isCorrect: option.isCorrect
        }))
      }))
    };
  }
  if (action.type === 'set-title') return { ...state, title: action.value };
  if (action.type === 'set-description') return { ...state, description: action.value };
  if (action.type === 'add-question') {
    return { ...state, questions: [...state.questions, action.question] };
  }
  if (action.type === 'remove-question') {
    return state.questions.length > 1
      ? { ...state, questions: state.questions.filter((question) => question.key !== action.key) }
      : state;
  }
  return {
    ...state,
    questions: state.questions.map((question) => {
      if ('key' in action && action.type === 'set-question' && question.key === action.key) {
        return { ...question, [action.field]: action.value };
      }
      if (!('questionKey' in action) || question.key !== action.questionKey) return question;
      if (action.type === 'add-option') {
        return {
          ...question,
          options: [...question.options, action.option]
        };
      }
      if (action.type === 'remove-option' && question.options.length > 2) {
        const options = question.options.filter((option) => option.key !== action.optionKey);
        if (!options.some((option) => option.isCorrect)) {
          return {
            ...question,
            options: options.map((option, index) => ({ ...option, isCorrect: index === 0 }))
          };
        }
        return { ...question, options };
      }
      if (action.type === 'mark-correct') {
        return {
          ...question,
          options: question.options.map((option) => ({
            ...option,
            isCorrect: option.key === action.optionKey
          }))
        };
      }
      if (action.type === 'set-option') {
        return {
          ...question,
          options: question.options.map((option) =>
            option.key === action.optionKey ? { ...option, text: action.value } : option
          )
        };
      }
      return question;
    })
  };
}

function readProgress(quizId: string): QuizProgress {
  try {
    const saved = localStorage.getItem(`qlete:quiz:${quizId}`);
    if (!saved) return { answers: {}, result: null, storageError: null };
    const parsed: unknown = JSON.parse(saved);
    if (!isRecord(parsed) || !isRecord(parsed.answers)) {
      throw new Error('O progresso salvo tem um formato inválido.');
    }

    const answers: Record<string, string> = {};
    for (const [questionId, optionId] of Object.entries(parsed.answers)) {
      if (/^[1-9]\d*$/.test(questionId) && typeof optionId === 'string') {
        answers[questionId] = optionId;
      }
    }

    return {
      answers,
      result: isQuizResult(parsed.result) ? parsed.result : null,
      storageError: null
    };
  } catch (cause) {
    console.error('Erro ao ler o progresso do quiz:', cause);
    return {
      answers: {},
      result: null,
      storageError: 'Não foi possível ler o progresso salvo neste dispositivo.'
    };
  }
}

function writeProgress(quizId: string, answers: Record<string, string>, result: QuizResult | null) {
  localStorage.setItem(`qlete:quiz:${quizId}`, JSON.stringify({ answers, result }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isQuizResult(value: unknown): value is QuizResult {
  return (
    isRecord(value) &&
    typeof value.score === 'number' &&
    typeof value.total === 'number' &&
    value.score >= 0 &&
    value.score <= value.total &&
    Array.isArray(value.questions) &&
    value.questions.every((question) =>
      isRecord(question) &&
      typeof question.questionId === 'number' &&
      typeof question.prompt === 'string' &&
      (question.selectedOptionId === null || typeof question.selectedOptionId === 'number') &&
      (question.explanation === null || typeof question.explanation === 'string') &&
      Array.isArray(question.options) &&
      question.options.every((option) =>
        isRecord(option) &&
        typeof option.id === 'number' &&
        typeof option.text === 'string' &&
        typeof option.isCorrect === 'boolean'
      )
    )
  );
}

function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof ApiError ? cause.message : fallback;
}

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | Qlete`;
  }, [title]);
}

function QleteLayout({ children, title }: { children: ReactNode; title: string }) {
  const { profile } = useAuth();
  usePageTitle(title);

  return (
    <main className="qlete-shell">
      <header className="qlete-topbar">
        <Brand href="/qlete" label="Qlete" ariaLabel="Qlete, página inicial" />
        <nav aria-label="Navegação do Qlete">
          {profile ? (
            <>
              <Link className="qlete-header-link" to="/qlete/me">Meus quizzes</Link>
              <Link className="qlete-header-action" to="/qlete/new">Criar quiz</Link>
            </>
          ) : (
            <Link className="qlete-header-link" to="/login?next=%2Fqlete%2Fnew">Entrar para criar</Link>
          )}
        </nav>
      </header>
      <section className="qlete-content">{children}</section>
      <DecorativeBackground />
    </main>
  );
}

function LoadingMessage() {
  return <p className="qlete-message" role="status">Carregando...</p>;
}

function ErrorMessage({ message }: { message: string }) {
  return <p className="auth-message" role="alert">{message}</p>;
}

function QuizCards({
  quizzes,
  ownerActions = false,
  onDeleted
}: {
  quizzes: QuizSummary[];
  ownerActions?: boolean;
  onDeleted?: (quizId: string) => void;
}) {
  if (!quizzes.length) {
    return <p className="qlete-message">Nenhum quiz encontrado.</p>;
  }

  return (
    <div className="qlete-grid">
      {quizzes.map((quiz) => (
        <article className="qlete-card" key={quiz.id}>
          <Link className="qlete-card-body" to={`/qlete/q/${quiz.id}`}>
            <span className="eyebrow">{quiz.questionCount} perguntas</span>
            <h2>{quiz.title}</h2>
            {quiz.description && <p>{quiz.description}</p>}
            <span className="qlete-card-link">Abrir quiz <span aria-hidden="true">→</span></span>
          </Link>
          {ownerActions && onDeleted && (
            <QuizOwnerActions quizId={quiz.id} onDeleted={() => onDeleted(quiz.id)} />
          )}
        </article>
      ))}
    </div>
  );
}

function QuizOwnerActions({ quizId, onDeleted }: { quizId: string; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setError('');
    setIsDeleting(true);
    try {
      await qleteApi.delete(quizId);
      onDeleted();
    } catch (cause) {
      console.error('Erro ao excluir o quiz:', cause);
      setError(errorMessage(cause, 'Não foi possível excluir o quiz.'));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="qlete-owner-actions">
      <Link className="qlete-secondary-button" to={`/qlete/q/${quizId}/edit`}>Editar</Link>
      {confirming ? (
        <div className="qlete-delete-confirmation">
          <p>Tem certeza que deseja excluir este quiz?</p>
          {error && <ErrorMessage message={error} />}
          <button
            className="confirm-logout-button"
            type="button"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? 'Excluindo...' : 'Sim, excluir quiz'}
          </button>
          <button
            className="cancel-logout-button"
            type="button"
            onClick={() => { setConfirming(false); setError(''); }}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          className="qlete-secondary-button"
          type="button"
          onClick={() => setConfirming(true)}
        >
          Excluir
        </button>
      )}
    </div>
  );
}

export function QleteHomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const requestedPage = Number(searchParams.get('page') ?? '1');
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [searchInput, setSearchInput] = useState(search);
  const [state, setState] = useState<PageState<Awaited<ReturnType<typeof qleteApi.list>>>>({
    status: 'loading'
  });
  usePageTitle('Quizzes');

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    void qleteApi.list(search, page)
      .then((result) => {
        if (active) setState({ status: 'ready', value: result });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        console.error('Erro ao carregar os quizzes:', cause);
        setState({ status: 'error', message: errorMessage(cause, 'Não foi possível carregar os quizzes.') });
      });
    return () => { active = false; };
  }, [search, page]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set('q', searchInput.trim());
    setSearchParams(params);
  }

  return (
    <QleteLayout title="Quizzes">
      <div className="qlete-heading-row">
        <div>
          <p className="eyebrow">Aprender praticando</p>
          <h1>Qlete</h1>
          <p>Encontre um quiz e teste o que você sabe.</p>
        </div>
      </div>
      <form className="qlete-search" onSubmit={handleSearch}>
        <label className="auth-field" htmlFor="qlete-search">Buscar quizzes</label>
        <div>
          <input
            className="auth-input"
            id="qlete-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Busque por título, tema ou palavras-chave"
          />
          <button className="submit-button" type="submit">Buscar</button>
        </div>
      </form>
      {state.status === 'loading' ? <LoadingMessage /> : null}
      {state.status === 'error' ? <ErrorMessage message={state.message} /> : null}
      {state.status === 'ready' && (
        <>
          <QuizCards quizzes={state.value.quizzes} />
          <div className="qlete-pagination">
            <button
              className="qlete-secondary-button"
              type="button"
              disabled={page <= 1}
              onClick={() => setSearchParams({ ...(search ? { q: search } : {}), page: String(page - 1) })}
            >
              Anterior
            </button>
            <span>Página {page}</span>
            <button
              className="qlete-secondary-button"
              type="button"
              disabled={!state.value.hasMore}
              onClick={() => setSearchParams({ ...(search ? { q: search } : {}), page: String(page + 1) })}
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </QleteLayout>
  );
}

export function QleteIntroPage() {
  const { quizId = '' } = useParams();
  const { profile, loading: authLoading } = useAuth();
  const [state, setState] = useState<PageState<Quiz>>({ status: 'loading' });
  const [temporaryName, setTemporaryName] = useState('');
  const [leaderboard, setLeaderboard] = useState<PageState<QuizLeaderboardEntry[]>>({
    status: 'loading'
  });
  const [leaderboardFilter, setLeaderboardFilter] = useState<'all' | 'authenticated' | 'temporary'>('all');
  const navigate = useNavigate();
  usePageTitle('Quiz');

  useEffect(() => {
    setTemporaryName(readTemporaryName(quizId));
  }, [quizId]);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    void qleteApi.get(quizId)
      .then((quiz) => { if (active) setState({ status: 'ready', value: quiz }); })
      .catch((cause: unknown) => {
        if (!active) return;
        console.error('Erro ao carregar o quiz:', cause);
        setState({ status: 'error', message: errorMessage(cause, 'Não foi possível carregar este quiz.') });
      });
    setLeaderboard({ status: 'loading' });
    void qleteApi.getLeaderboard(quizId, leaderboardFilter)
      .then((entries) => { if (active) setLeaderboard({ status: 'ready', value: entries }); })
      .catch((cause: unknown) => {
        if (!active) return;
        console.error('Erro ao carregar o placar:', cause);
        setLeaderboard({
          status: 'error',
          message: errorMessage(cause, 'Não foi possível carregar o placar.')
        });
      });
    return () => { active = false; };
  }, [leaderboardFilter, quizId]);

  return (
    <QleteLayout title="Quiz">
      <Link className="back-link" to="/qlete">← Todos os quizzes</Link>
      {state.status === 'loading' ? <LoadingMessage /> : null}
      {state.status === 'error' ? <ErrorMessage message={state.message} /> : null}
      {state.status === 'ready' && (
        <div className="qlete-intro-layout">
          <article className="qlete-panel">
            <p className="eyebrow">{state.value.questions.length} perguntas</p>
            <h1>{state.value.title}</h1>
            {state.value.description && <p>{state.value.description}</p>}
            {!authLoading && !profile && (
              <label className="qlete-temporary-name">
                Nome no placar (opcional)
                <input
                  value={temporaryName}
                  maxLength={40}
                  onChange={(event) => setTemporaryName(event.target.value)}
                  onBlur={() => saveTemporaryName(quizId, temporaryName)}
                  placeholder="Ex.: Jogador 1"
                />
              </label>
            )}
            {state.value.isOwner && (
              <QuizOwnerActions
                quizId={quizId}
                onDeleted={() => navigate('/qlete', { replace: true })}
              />
            )}
            <Link className="submit-button qlete-start-button" to={`/qlete/q/${quizId}/1`}>
              Começar
            </Link>
          </article>
          <aside className="qlete-panel qlete-leaderboard" aria-labelledby="leaderboard-title">
            <p className="eyebrow">Placar</p>
            <h2 id="leaderboard-title">Melhores pontuações</h2>
            <div className="qlete-leaderboard-filters" aria-label="Filtrar placar">
              {([
                ['all', 'Todos'],
                ['authenticated', 'Cadastrados'],
                ['temporary', 'Temporários']
              ] as const).map(([filter, label]) => (
                <button
                  className={leaderboardFilter === filter ? 'is-active' : ''}
                  type="button"
                  key={filter}
                  onClick={() => setLeaderboardFilter(filter)}
                >
                  {label}
                </button>
              ))}
            </div>
            {leaderboard.status === 'loading' && <LoadingMessage />}
            {leaderboard.status === 'error' && <ErrorMessage message={leaderboard.message} />}
            {leaderboard.status === 'ready' && leaderboard.value.length === 0 && (
              <p>Ainda não há pontuações registradas.</p>
            )}
            {leaderboard.status === 'ready' && leaderboard.value.length > 0 && (
              <ol className="qlete-leaderboard-list">
                {leaderboard.value.map((entry) => (
                  <li key={`${entry.username ?? entry.temporaryName}-${entry.position}`}>
                    <span className="qlete-leaderboard-position">#{entry.position}</span>
                    <span className="qlete-leaderboard-user">
                      <strong>{entry.name ?? entry.temporaryName}</strong>
                      <small>{entry.username ? `@${entry.username}` : 'Usuário temporário'}</small>
                    </span>
                    <strong>{entry.score}/{entry.total}</strong>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        </div>
      )}
    </QleteLayout>
  );
}

export function QleteQuestionPage() {
  const { quizId = '', step } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<PageState<Quiz>>({ status: 'loading' });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [storageError, setStorageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [feedbackShown, setFeedbackShown] = useState(false);
  const [answerCheck, setAnswerCheck] = useState<QuizAnswerCheck | null>(null);
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  const [temporaryName, setTemporaryName] = useState('');
  const stepNumber = step && /^[1-9]\d*$/.test(step) ? Number(step) : 0;
  usePageTitle('Pergunta');

  useEffect(() => {
    setTemporaryName(readTemporaryName(quizId));
  }, [quizId]);

  useEffect(() => {
    setFeedbackShown(false);
    setAnswerCheck(null);
    setSubmitError('');
  }, [quizId, step]);

  useEffect(() => {
    const progress = readProgress(quizId);
    setAnswers(progress.answers);
    setResult(progress.result);
    setStorageError(progress.storageError);
  }, [quizId]);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    void qleteApi.get(quizId)
      .then((quiz) => {
        if (active) setState({ status: 'ready', value: shuffleOptions(quiz) });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        console.error('Erro ao carregar a pergunta:', cause);
        setState({ status: 'error', message: errorMessage(cause, 'Não foi possível carregar este quiz.') });
      });
    return () => { active = false; };
  }, [quizId]);

  useEffect(() => {
    if (state.status !== 'ready') return;
    const validOptions = new Map(
      state.value.questions.map((question) => [
        String(question.id),
        new Set(question.options.map((option) => String(option.id)))
      ])
    );
    const cleanAnswers = Object.fromEntries(
      Object.entries(answers).filter(([questionId, optionId]) =>
        validOptions.get(questionId)?.has(optionId)
      )
    );
    if (Object.keys(cleanAnswers).length !== Object.keys(answers).length) {
      setAnswers(cleanAnswers);
      return;
    }
    try {
      writeProgress(quizId, answers, result);
      setStorageError(null);
    } catch (cause) {
      console.error('Erro ao salvar o progresso do quiz:', cause);
      setStorageError('Não foi possível salvar o progresso neste dispositivo.');
    }
  }, [answers, quizId, result, state]);

  if (state.status === 'ready' && (!stepNumber || stepNumber > state.value.questions.length)) {
    return <Navigate to={`/qlete/q/${quizId}`} replace />;
  }

  async function submit() {
    setSubmitError('');
    setIsSubmitting(true);
    try {
      let name = temporaryName;
      if (!profile && !name) {
        name = window.prompt('Digite um nome para aparecer no placar (opcional):')?.trim() ?? '';
        if (name) {
          saveTemporaryName(quizId, name);
          setTemporaryName(name);
        }
      }
      const submittedResult = await qleteApi.submit(quizId, answers, profile ? undefined : name || undefined);
      setResult(submittedResult);
      try {
        writeProgress(quizId, answers, submittedResult);
        setStorageError(null);
      } catch (cause) {
        console.error('Erro ao salvar o resultado do quiz:', cause);
        setStorageError('Não foi possível salvar o resultado neste dispositivo.');
      }
      navigate(`/qlete/q/${quizId}/resultado`);
    } catch (cause) {
      console.error('Erro ao corrigir o quiz:', cause);
      setSubmitError(errorMessage(cause, 'Não foi possível corrigir suas respostas.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function checkCurrentAnswer() {
    if (!question) {
      return;
    }

    setSubmitError('');
    setIsCheckingAnswer(true);
    try {
      const checkedAnswer = await qleteApi.checkAnswer(
        quizId,
        question.id,
        selectedOptionId ? Number(selectedOptionId) : null,
      );
      setAnswerCheck(checkedAnswer);
      setFeedbackShown(true);
    } catch (cause) {
      console.error('Erro ao verificar a resposta:', cause);
      setSubmitError(errorMessage(cause, 'Não foi possível verificar sua resposta.'));
    } finally {
      setIsCheckingAnswer(false);
    }
  }

  const question = state.status === 'ready' ? state.value.questions[stepNumber - 1] : undefined;
  const selectedOptionId = question ? answers[String(question.id)] : undefined;
  const selectedOptionIsCorrect = Boolean(
    selectedOptionId &&
    answerCheck &&
    Number(selectedOptionId) === answerCheck.correctOptionId
  );

  return (
    <QleteLayout title="Pergunta">
      <Link className="back-link" to={`/qlete/q/${quizId}`}>← Introdução</Link>
      {state.status === 'loading' ? <LoadingMessage /> : null}
      {state.status === 'error' ? <ErrorMessage message={state.message} /> : null}
      {question && state.status === 'ready' && (
        <article className="qlete-panel">
          <p className="eyebrow">Pergunta {stepNumber} de {state.value.questions.length}</p>
          <h1>{question.prompt}</h1>
          <fieldset className="qlete-options">
            <legend className="sr-only">Escolha uma alternativa</legend>
            {question.options.map((option) => (
              <label
                className={`qlete-option${feedbackShown && answerCheck?.correctOptionId === option.id ? ' is-correct' : ''}${feedbackShown && selectedOptionId === String(option.id) && answerCheck && !answerCheck.isCorrect ? ' is-selected-wrong' : ''}`}
                key={option.id}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={answers[String(question.id)] === String(option.id)}
                  disabled={feedbackShown}
                  onChange={() => {
                    setAnswers((current) => ({ ...current, [question.id]: String(option.id) }));
                    setResult(null);
                  }}
                />
                <span>{option.text}</span>
                {feedbackShown && answerCheck?.correctOptionId === option.id && <strong className="qlete-answer-label">Correta</strong>}
                {feedbackShown && selectedOptionId === String(option.id) && answerCheck && !answerCheck.isCorrect && (
                  <strong className="qlete-answer-label">Sua resposta</strong>
                )}
              </label>
            ))}
          </fieldset>
          {feedbackShown && (
            <p
              className={`qlete-answer-feedback ${selectedOptionIsCorrect ? 'is-correct' : selectedOptionId ? 'is-wrong' : 'is-unanswered'}`}
              role="status"
            >
              {selectedOptionIsCorrect
                ? 'Resposta correta!'
                : selectedOptionId
                  ? 'Resposta incorreta. A alternativa correta está destacada em verde.'
                  : `Sem resposta. A alternativa correta é: ${question.options.find((option) => option.id === answerCheck?.correctOptionId)?.text ?? 'não disponível'}.`}
            </p>
          )}
          {storageError && <p className="auth-message" role="alert">{storageError}</p>}
          {submitError && <ErrorMessage message={submitError} />}
          <div className="qlete-actions">
            <button
              className="qlete-secondary-button"
              type="button"
              onClick={() => stepNumber > 1
                ? navigate(`/qlete/q/${quizId}/${stepNumber - 1}`)
                : navigate(`/qlete/q/${quizId}`)}
            >
              Voltar
            </button>
            {stepNumber < state.value.questions.length ? (
              <button
                className="submit-button"
                type="button"
                disabled={isCheckingAnswer}
                onClick={() => feedbackShown
                  ? navigate(`/qlete/q/${quizId}/${stepNumber + 1}`)
                  : void checkCurrentAnswer()}
              >
                {isCheckingAnswer ? 'Verificando...' : feedbackShown ? 'Próxima pergunta' : 'Avançar'}
              </button>
            ) : (
              <button
                className="submit-button"
                type="button"
                disabled={isSubmitting || isCheckingAnswer}
                onClick={() => feedbackShown ? void submit() : void checkCurrentAnswer()}
              >
                {isCheckingAnswer ? 'Verificando...' : isSubmitting ? 'Corrigindo...' : feedbackShown ? 'Ver pontuação' : 'Finalizar e corrigir'}
              </button>
            )}
          </div>
        </article>
      )}
    </QleteLayout>
  );
}

export function QleteResultPage() {
  const { quizId = '' } = useParams();
  const { profile, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [temporaryName, setTemporaryName] = useState('');
  const [leaderboard, setLeaderboard] = useState<PageState<QuizLeaderboardEntry[]>>({
    status: 'loading'
  });
  usePageTitle('Resultado');

  useEffect(() => {
    setProgress(readProgress(quizId));
    setTemporaryName(readTemporaryName(quizId));
  }, [quizId]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile && !temporaryName) {
      setLeaderboard({ status: 'ready', value: [] });
      return;
    }

    let active = true;
    setLeaderboard({ status: 'loading' });
    void qleteApi.getLeaderboard(quizId, 'all')
      .then((entries) => {
        if (active) setLeaderboard({ status: 'ready', value: entries });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        console.error('Erro ao carregar a posição no placar:', cause);
        setLeaderboard({
          status: 'error',
          message: errorMessage(cause, 'Não foi possível carregar sua posição no placar.')
        });
      });

    return () => { active = false; };
  }, [authLoading, profile, quizId, temporaryName]);

  if (!progress) {
    return <QleteLayout title="Resultado"><LoadingMessage /></QleteLayout>;
  }

  if (!progress.result) {
    return (
      <QleteLayout title="Resultado">
        {progress.storageError && <ErrorMessage message={progress.storageError} />}
        <Link className="back-link" to={`/qlete/q/${quizId}`}>Voltar ao quiz</Link>
      </QleteLayout>
    );
  }

  const grade = progress.result.total > 0
    ? (progress.result.score / progress.result.total) * 10
    : 0;
  const scoreClass = grade < 3
    ? 'is-score-low'
    : grade < 5
      ? 'is-score-orange'
      : grade < 7
        ? 'is-score-yellow'
        : grade < 9
          ? 'is-score-light-green'
          : 'is-score-dark-green';
  const scoreMessage = grade < 3
    ? 'Continue praticando: cada tentativa ajuda a aprender.'
    : grade < 5
      ? 'Bom começo! Continue estudando para avançar.'
      : grade < 7
        ? 'Você está no caminho certo. Continue assim!'
        : grade < 9
          ? 'Muito bem! Você teve um ótimo resultado.'
          : 'Excelente resultado! Você domina o conteúdo.';

  return (
    <QleteLayout title="Resultado">
      <Link className="back-link" to="/qlete">← Todos os quizzes</Link>
      <section className="qlete-panel">
        <p className="eyebrow">Resultado</p>
        <div className={`qlete-score ${scoreClass}`}>
          <span className="qlete-score-label">Sua pontuação</span>
          <strong className="qlete-score-grade">{grade.toFixed(1)}<span> / 10</span></strong>
          <p>{progress.result.score} de {progress.result.total} respostas corretas</p>
          <div
            className="qlete-score-track"
            role="progressbar"
            aria-label="Nota do quiz em uma escala de 0 a 10"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={Number(grade.toFixed(1))}
          >
            <span style={{ width: `${grade * 10}%` }} />
          </div>
          <p className="qlete-score-message">{scoreMessage}</p>
        </div>
        {!authLoading && !profile && (
        <p className="qlete-signup-prompt">
          <span>Crie uma conta para colocar sua pontuação no placar.</span>{' '}
          <Link className="auth-link" to="/signup">Criar uma conta</Link>
        </p>
        )}
        {(profile || temporaryName) && leaderboard.status === 'loading' && (
          <p className="qlete-ranking-status">Consultando sua posição no placar...</p>
        )}
        {(profile || temporaryName) && leaderboard.status === 'error' && (
          <p className="qlete-ranking-status is-error">{leaderboard.message}</p>
        )}
        {(profile || temporaryName) && leaderboard.status === 'ready' && (() => {
          const entry = leaderboard.value.find(item =>
            profile ? item.username === profile.username : item.temporaryName === temporaryName
          );
          return entry ? (
            <p className="qlete-ranking-position">
              Sua posição no placar: <strong>#{entry.position}</strong>
            </p>
          ) : null;
        })()}
        <h1>Confira suas respostas</h1>
        <div className="qlete-review">
          {progress.result.questions.map((question, index) => (
            <article className="qlete-review-item" key={question.questionId}>
              <h2>{index + 1}. {question.prompt}</h2>
              <ul>
                {question.options.map((option) => (
                  <li
                    className={option.isCorrect ? 'is-correct' : (
                      option.id === question.selectedOptionId ? 'is-selected-wrong' : ''
                    )}
                    key={option.id}
                  >
                    {option.text}
                    {option.isCorrect ? ' — correta' : ''}
                    {option.id === question.selectedOptionId && !option.isCorrect ? ' — sua resposta' : ''}
                  </li>
                ))}
                {question.selectedOptionId === null && <li>Sem resposta</li>}
              </ul>
              {question.explanation && <p><strong>Explicação:</strong> {question.explanation}</p>}
            </article>
          ))}
        </div>
        {progress.storageError && <ErrorMessage message={progress.storageError} />}
        <Link className="submit-button qlete-start-button" to={`/qlete/q/${quizId}/1`}>
          Tentar novamente
        </Link>
      </section>
    </QleteLayout>
  );
}

export function QleteMePage() {
  const [state, setState] = useState<PageState<QuizSummary[]>>({ status: 'loading' });
  usePageTitle('Meus quizzes');

  useEffect(() => {
    let active = true;
    void qleteApi.getMine()
      .then((result) => { if (active) setState({ status: 'ready', value: result.quizzes }); })
      .catch((cause: unknown) => {
        if (!active) return;
        console.error('Erro ao carregar seus quizzes:', cause);
        setState({ status: 'error', message: errorMessage(cause, 'Não foi possível carregar seus quizzes.') });
      });
    return () => { active = false; };
  }, []);

  return (
    <QleteLayout title="Meus quizzes">
      <Link className="back-link" to="/qlete">← Todos os quizzes</Link>
      <div className="qlete-heading-row">
        <h1>Meus quizzes</h1>
        <Link className="submit-button qlete-start-button" to="/qlete/new">Criar quiz</Link>
      </div>
      {state.status === 'loading' ? <LoadingMessage /> : null}
      {state.status === 'error' ? <ErrorMessage message={state.message} /> : null}
      {state.status === 'ready' && (
        <QuizCards
          quizzes={state.value}
          ownerActions
          onDeleted={(quizId) => setState((current) => current.status === 'ready'
            ? { status: 'ready', value: current.value.filter((quiz) => quiz.id !== quizId) }
            : current)}
        />
      )}
    </QleteLayout>
  );
}

function QleteJsonImportForm() {
  const navigate = useNavigate();
  const [json, setJson] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  usePageTitle('Importar quiz');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    let quiz: unknown;
    try {
      quiz = JSON.parse(json);
    } catch (cause) {
      console.error('JSON de quiz inválido:', cause);
      setError('O conteúdo não é um JSON válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await qleteApi.importQuiz(quiz);
      navigate(`/qlete/q/${created.id}`);
    } catch (cause) {
      console.error('Erro ao importar o quiz:', cause);
      setError(errorMessage(cause, 'Não foi possível importar o quiz.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setJson(await file.text());
      setError('');
    } catch (cause) {
      console.error('Erro ao ler o arquivo de quiz:', cause);
      setError('Não foi possível ler o arquivo selecionado.');
    }
  }

  return (
    <section className="qlete-panel">
      <p className="eyebrow">Importar quiz</p>
      <h2>Importar de JSON</h2>
      <p>Cole o JSON do quiz ou selecione um arquivo .json. O conteúdo será validado pelo servidor.</p>
      <form className="qlete-import-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          Arquivo JSON
          <input className="auth-input" type="file" accept=".json,application/json" onChange={(event) => void handleFile(event)} />
        </label>
        <label className="auth-field" htmlFor="qlete-json">Conteúdo JSON</label>
        <textarea
          className="auth-input qlete-json-input"
          id="qlete-json"
          value={json}
          onChange={(event) => setJson(event.target.value)}
          placeholder={'{\n  "title": "...",\n  "questions": []\n}'}
          required
        />
        {error && <ErrorMessage message={error} />}
        <button className="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Importando...' : 'Criar quiz'}
        </button>
      </form>
    </section>
  );
}

function QuizEditorForm({ quizId }: { quizId?: string }) {
  const navigate = useNavigate();
  const [editor, dispatch] = useReducer(editorReducer, undefined, newEditorState);
  const [isLoading, setIsLoading] = useState(Boolean(quizId));
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quizId) return;
    let active = true;
    setIsLoading(true);
    setLoadFailed(false);
    setError('');
    void qleteApi.getForEdit(quizId)
      .then((quiz) => {
        if (active) dispatch({ type: 'load', quiz });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        console.error('Erro ao carregar quiz para edição:', cause);
        setLoadFailed(true);
        setError(errorMessage(cause, 'Não foi possível carregar este quiz para edição.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [quizId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    const payload = {
      title: editor.title,
      description: editor.description,
      questions: editor.questions.map((question) => ({
        prompt: question.prompt,
        explanation: question.explanation,
        options: question.options.map(({ text, isCorrect }) => ({ text, isCorrect }))
      }))
    };

    try {
      const result = quizId
        ? await qleteApi.update(quizId, payload)
        : await qleteApi.create(payload);
      const createdId = quizId ?? ('id' in result ? result.id : undefined);
      if (!createdId) throw new ApiError('A API não retornou o identificador do quiz.');
      if (quizId) {
        try {
          localStorage.removeItem(`qlete:quiz:${quizId}`);
        } catch (cause) {
          console.error('Não foi possível remover o progresso antigo do quiz:', cause);
        }
      }
      navigate(`/qlete/q/${createdId}`);
    } catch (cause) {
      console.error('Erro ao salvar o quiz:', cause);
      setError(errorMessage(cause, 'Não foi possível salvar o quiz.'));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingMessage />;
  if (quizId && loadFailed) return <ErrorMessage message={error} />;

  return (
    <form className="qlete-editor-form" onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}
      <label className="auth-field">
        Título
        <input
          className="auth-input"
          value={editor.title}
          maxLength={160}
          onChange={(event) => dispatch({ type: 'set-title', value: event.target.value })}
          required
        />
      </label>
      <label className="auth-field">
        Descrição
        <textarea
          className="auth-input qlete-description-input"
          value={editor.description}
          maxLength={2000}
          onChange={(event) => dispatch({ type: 'set-description', value: event.target.value })}
        />
      </label>
      <div className="qlete-editor-questions">
        {editor.questions.map((question, index) => (
          <fieldset className="qlete-editor-question" key={question.key}>
            <legend>Pergunta {index + 1}</legend>
            <label className="auth-field">
              Enunciado
              <textarea
                className="auth-input qlete-description-input"
                value={question.prompt}
                maxLength={1000}
                onChange={(event) => dispatch({
                  type: 'set-question',
                  key: question.key,
                  field: 'prompt',
                  value: event.target.value
                })}
                required
              />
            </label>
            <label className="auth-field">
              Explicação (opcional)
              <textarea
                className="auth-input qlete-description-input"
                value={question.explanation}
                maxLength={2000}
                onChange={(event) => dispatch({
                  type: 'set-question',
                  key: question.key,
                  field: 'explanation',
                  value: event.target.value
                })}
              />
            </label>
            <div className="qlete-editor-options">
              <span className="auth-field">Alternativas (marque a correta)</span>
              {question.options.map((option, optionIndex) => (
                <div className="qlete-editor-option" key={option.key}>
                  <input
                    type="radio"
                    name={`correct-${question.key}`}
                    aria-label={`Marcar alternativa ${optionIndex + 1} como correta`}
                    checked={option.isCorrect}
                    onChange={() => dispatch({
                      type: 'mark-correct',
                      questionKey: question.key,
                      optionKey: option.key
                    })}
                  />
                  <input
                    className="auth-input"
                    aria-label={`Texto da alternativa ${optionIndex + 1}`}
                    value={option.text}
                    maxLength={500}
                    onChange={(event) => dispatch({
                      type: 'set-option',
                      questionKey: question.key,
                      optionKey: option.key,
                      value: event.target.value
                    })}
                    required
                  />
                  <button
                    className="qlete-remove-button"
                    type="button"
                    disabled={question.options.length <= 2}
                    onClick={() => dispatch({
                      type: 'remove-option',
                      questionKey: question.key,
                      optionKey: option.key
                    })}
                  >
                    Remover
                  </button>
                </div>
              ))}
              {question.options.length < 10 && (
                <button
                  className="qlete-secondary-button"
                  type="button"
                  onClick={() => dispatch({
                    type: 'add-option',
                    questionKey: question.key,
                    option: { key: crypto.randomUUID(), text: '', isCorrect: false }
                  })}
                >
                  Adicionar alternativa
                </button>
              )}
            </div>
            <button
              className="qlete-remove-button"
              type="button"
              disabled={editor.questions.length <= 1}
              onClick={() => dispatch({ type: 'remove-question', key: question.key })}
            >
              Remover pergunta
            </button>
          </fieldset>
        ))}
      </div>
      {editor.questions.length < 100 && (
        <button className="qlete-secondary-button" type="button" onClick={() => dispatch({
          type: 'add-question',
          question: newEditorQuestion()
        })}>
          Adicionar pergunta
        </button>
      )}
      <button className="submit-button" type="submit" disabled={isSaving}>
        {isSaving ? 'Salvando...' : quizId ? 'Salvar alterações' : 'Criar quiz'}
      </button>
    </form>
  );
}

export function QleteNewPage() {
  const [mode, setMode] = useState<'editor' | 'import'>('editor');
  usePageTitle('Criar quiz');

  return (
    <QleteLayout title="Criar quiz">
      <Link className="back-link" to="/qlete/me">← Meus quizzes</Link>
      <div className="qlete-heading-row">
        <div>
          <p className="eyebrow">Criar quiz</p>
          <h1>Novo quiz</h1>
        </div>
        <button
          className="qlete-secondary-button"
          type="button"
          onClick={() => setMode((current) => current === 'editor' ? 'import' : 'editor')}
        >
          {mode === 'editor' ? 'Importar JSON' : 'Usar editor'}
        </button>
      </div>
      {mode === 'editor' ? (
        <section className="qlete-panel">
          <QuizEditorForm />
        </section>
      ) : <QleteJsonImportForm />}
    </QleteLayout>
  );
}

export function QleteEditPage() {
  const { quizId = '' } = useParams();
  usePageTitle('Editar quiz');

  return (
    <QleteLayout title="Editar quiz">
      <Link className="back-link" to={`/qlete/q/${quizId}`}>← Voltar ao quiz</Link>
      <section className="qlete-panel">
        <p className="eyebrow">Editar quiz</p>
        <h1>Atualizar conteúdo</h1>
        <QuizEditorForm quizId={quizId} />
      </section>
    </QleteLayout>
  );
}
