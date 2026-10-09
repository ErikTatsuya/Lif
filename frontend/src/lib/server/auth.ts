function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

let loggedApiBaseUrl: string | undefined;

export function authApiUrl(
	path: 'login' | 'signup' | 'me',
	platformEnv?: { API_BASE_URL?: string },
	hasPlatform = false
) {
	const configuredBaseUrl =
		platformEnv?.API_BASE_URL || (hasPlatform ? '' : 'http://localhost:3000');
	if (!configuredBaseUrl) {
		throw new Error('API_BASE_URL não está configurada.');
	}

	const baseUrl = configuredBaseUrl.replace(/\/+$/, '');
	if (baseUrl !== loggedApiBaseUrl) {
		console.log('URL base da API:', baseUrl);
		loggedApiBaseUrl = baseUrl;
	}

	return `${baseUrl}/auth/${path}`;
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
