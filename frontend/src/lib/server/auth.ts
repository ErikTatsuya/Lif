import process from 'node:process';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function authApiUrl(path: 'login' | 'signup' | 'me') {
	const baseUrl = (process.env.API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
	return `${baseUrl}/auth/${path}`;
}

export async function getAuthError(response: Response, fallback: string) {
	try {
		const body: unknown = await response.json();
		if (!isRecord(body)) return fallback;

		if (typeof body.error === 'string') return body.error;
		if (typeof body.message === 'string') return body.message;
	} catch {
		return fallback;
	}

	return fallback;
}
