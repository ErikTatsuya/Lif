import { API_BASE_URL } from './api';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function authApiUrl(path: 'login' | 'signup' | 'me') {
	return `${API_BASE_URL}/auth/${path}`;
}

export async function getAuthError(response: Response, fallback: string) {
	try {
		const body: unknown = await response.json();
		if (!isRecord(body)) return fallback;

		if (typeof body.error === 'string') return body.error;
		if (typeof body.message === 'string') return body.message;
	} catch (cause) {
		console.log('Erro ao ler a resposta de erro da API:', cause);
		return fallback;
	}

	return fallback;
}
