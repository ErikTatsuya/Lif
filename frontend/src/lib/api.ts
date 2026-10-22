export type Profile = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export type DailyEvent = {
  day: number;
  month: number;
  year: number;
  title: string;
  description: string;
};

export type QuizSummary = {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  createdAt: string;
};

export type Quiz = {
  id: string;
  isOwner: boolean;
  title: string;
  description: string;
  questions: Array<{
    id: number;
    position: number;
    prompt: string;
    options: Array<{ id: number; position: number; text: string }>;
  }>;
};

export type EditableQuiz = {
  id: string;
  title: string;
  description: string;
  questions: Array<{
    id: number;
    position: number;
    prompt: string;
    explanation: string | null;
    options: Array<{ id: number; position: number; text: string; isCorrect: boolean }>;
  }>;
};

export type QuizResult = {
  score: number;
  total: number;
  questions: Array<{
    questionId: number;
    prompt: string;
    selectedOptionId: number | null;
    explanation: string | null;
    options: Array<{ id: number; text: string; isCorrect: boolean }>;
  }>;
};

export type QuizAnswerCheck = {
  isCorrect: boolean;
  correctOptionId: number;
};

let currentUserRequest: Promise<Profile | null> | null = null;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function backendBaseUrl(): string {
  return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isProfile(value: unknown): value is Profile {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.username === 'string' &&
    typeof value.email === 'string'
  );
}

function isDailyEvent(value: unknown): value is DailyEvent {
  return (
    isRecord(value) &&
    typeof value.day === 'number' &&
    typeof value.month === 'number' &&
    typeof value.year === 'number' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string'
  );
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (!isRecord(body)) return fallback;
    if (typeof body.error === 'string') return body.error;
    if (typeof body.message === 'string') return body.message;
  } catch (cause) {
    console.error('Erro ao ler a resposta de erro da API:', cause);
  }

  return fallback;
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  let url: string;
  try {
    url = `${backendBaseUrl()}${path}`;
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    throw new ApiError('Não foi possível configurar a conexão com a API.');
  }

  try {
    return await fetch(url, { ...init, credentials: 'include' });
  } catch (cause) {
    console.error(`Erro ao conectar com a API em ${path}:`, cause);
    throw new ApiError('Não foi possível conectar à API. Verifique a conexão e tente novamente.');
  }
}

async function parseProfileResponse(response: Response): Promise<Profile> {
  let body: unknown;
  try {
    body = (await response.json()) as unknown;
  } catch (cause) {
    console.error('Erro ao ler a resposta da API:', cause);
    throw new ApiError('A API retornou uma resposta inválida.', response.status);
  }

  if (!isRecord(body) || !isProfile(body.user)) {
    throw new ApiError('A API retornou dados de perfil inválidos.', response.status);
  }

  return body.user;
}

export const authApi = {
  getCurrentUser(): Promise<Profile | null> {
    if (currentUserRequest) return currentUserRequest;

    const requestPromise = (async () => {
      const response = await request('/auth/me');
      if (response.status === 401) return null;
      if (!response.ok) {
        const message = await readError(response, 'Não foi possível verificar sua sessão.');
        throw new ApiError(message, response.status);
      }

      return parseProfileResponse(response);
    })().finally(() => {
      if (currentUserRequest === requestPromise) currentUserRequest = null;
    });

    currentUserRequest = requestPromise;
    return requestPromise;
  },

  async login(identifier: string, password: string): Promise<void> {
    const credentials = identifier.includes('@')
      ? { email: identifier, password }
      : { username: identifier, password };
    const response = await request('/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const message = await readError(response, 'Não foi possível entrar. Tente novamente.');
      throw new ApiError(message, response.status);
    }

    currentUserRequest = null;
    await parseProfileResponse(response);
  },

  async signup(data: {
    username: string;
    name: string;
    email: string;
    password: string;
  }): Promise<void> {
    const response = await request('/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const message = await readError(
        response,
        'Não foi possível criar a conta. Tente novamente.'
      );
      throw new ApiError(message, response.status);
    }
  },

  async logout(): Promise<void> {
    const response = await request('/auth/signout', { method: 'POST' });
    if (!response.ok) {
      const message = await readError(response, 'Não foi possível sair da conta.');
      throw new ApiError(message, response.status);
    }
    currentUserRequest = null;
  }
};

export const eventApi = {
  async getTodaysEvent(): Promise<DailyEvent | null> {
    const response = await request('/daytron');
    if (response.status === 404) return null;
    if (!response.ok) {
      const message = await readError(response, 'Não foi possível carregar o dado diário.');
      throw new ApiError(message, response.status);
    }

    let body: unknown;
    try {
      body = (await response.json()) as unknown;
    } catch (cause) {
      console.error('Resposta inválida ao carregar o dado diário:', cause);
      throw new ApiError('A API retornou uma resposta inválida.', response.status);
    }

    if (!isRecord(body) || !Array.isArray(body.event)) {
      throw new ApiError('A API retornou dados diários inválidos.', response.status);
    }

    return body.event.find(isDailyEvent) ?? null;
  }
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch (cause) {
    console.error('Resposta inválida ao carregar dados do Qlete:', cause);
    throw new ApiError('A API retornou uma resposta inválida.', response.status);
  }
}

async function qleteRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await request(`/qlete${path}`, init);
  if (!response.ok) {
    const message = await readError(response, 'Não foi possível carregar os quizzes.');
    throw new ApiError(message, response.status);
  }
  return parseJsonResponse<T>(response);
}

export const qleteApi = {
  async list(search = '', page = 1) {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('q', search);
    return qleteRequest<{ quizzes: QuizSummary[]; page: number; pageSize: number; hasMore: boolean }>(
      `/quizzes?${params.toString()}`
    );
  },

  async get(id: string) {
    return qleteRequest<Quiz>(`/quizzes/${encodeURIComponent(id)}`);
  },

  async getForEdit(id: string) {
    return qleteRequest<EditableQuiz>(`/quizzes/${encodeURIComponent(id)}/edit`);
  },

  async submit(id: string, answers: Record<string, string>) {
    return qleteRequest<QuizResult>(`/quizzes/${encodeURIComponent(id)}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(answers)
    });
  },

  async checkAnswer(id: string, questionId: number, optionId: number | null) {
    return qleteRequest<QuizAnswerCheck>(`/quizzes/${encodeURIComponent(id)}/check`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ questionId, optionId })
    });
  },

  async getMine(page = 1) {
    return qleteRequest<{ quizzes: QuizSummary[]; page: number; pageSize: number; hasMore: boolean }>(
      `/me/quizzes?page=${page}`
    );
  },

  async importQuiz(quiz: unknown) {
    return qleteRequest<{ id: string }>('/quizzes/import', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(quiz)
    });
  },

  async create(quiz: unknown) {
    return qleteRequest<{ id: string }>('/quizzes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(quiz)
    });
  },

  async update(id: string, quiz: unknown) {
    return qleteRequest<{ message: string }>(`/quizzes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(quiz)
    });
  },

  async delete(id: string) {
    const response = await request(`/qlete/quizzes/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const message = await readError(response, 'Não foi possível excluir o quiz.');
      throw new ApiError(message, response.status);
    }
  }
};
