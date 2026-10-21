export type Profile = {
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

function apiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isProfile(value: unknown): value is Profile {
  return (
    isRecord(value) &&
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
    url = `${apiBaseUrl()}${path}`;
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
