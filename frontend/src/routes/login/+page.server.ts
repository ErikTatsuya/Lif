import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { authApiUrl, getAuthError } from '../../lib/server/auth';

export const load: PageServerLoad = async ({ cookies, fetch, platform }) => {
	const token = cookies.get('auth_token');
	if (!token) return { isAlreadyLoggedIn: false };

	let response: Response;
	try {
		response = await fetch(authApiUrl('me', platform?.env), {
			headers: { cookie: `auth_token=${encodeURIComponent(token)}` }
		});
	} catch (cause) {
		console.log('Erro ao verificar a sessão:', cause);
		return {
			isAlreadyLoggedIn: false,
			sessionCheckMessage: 'Não foi possível verificar sua sessão.'
		};
	}

	if (response.status === 401) {
		cookies.delete('auth_token', { path: '/' });
		return { isAlreadyLoggedIn: false };
	}

	if (!response.ok) {
		console.log('Erro ao verificar a sessão:', response.statusText);
		return {
			isAlreadyLoggedIn: false,
			sessionCheckMessage: 'Não foi possível verificar sua sessão.'
		};
	}

	return { isAlreadyLoggedIn: true };
};

export const actions: Actions = {
	default: async ({ request, cookies, fetch, platform }) => {
		const formData = await request.formData();
		const identifier = String(formData.get('identifier') ?? '').trim();
		const password = String(formData.get('password') ?? '');

		if (!identifier || !password) {
			return fail(400, { message: 'Preencha usuário/e-mail e senha.' });
		}

		const credentials = identifier.includes('@')
			? { email: identifier, password }
			: { username: identifier, password };

		let response: Response;
		try {
			response = await fetch(authApiUrl('login', platform?.env), {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(credentials)
			});
		} catch (cause) {
			console.log('Erro ao conectar com a API de login:', cause);
			return fail(503, { message: 'Não foi possível conectar à API. Tente novamente.' });
		}

		if (!response.ok) {
			const responseBody = await response.clone().text();
			const message = await getAuthError(response, 'Não foi possível entrar. Tente novamente.');
			console.log('Erro no login:', message);
			return fail(response.status, {
				message,
				apiResponse: {
					url: response.url,
					contentType: response.headers.get('content-type'),
					body: responseBody.slice(0, 500)
				}
			});
		}

		const setCookie = response.headers.get('set-cookie');
		const authCookie = setCookie?.split(';', 1)[0];
		const separatorIndex = authCookie?.indexOf('=') ?? -1;
		const token = separatorIndex >= 0 ? authCookie?.slice(separatorIndex + 1) : undefined;

		if (!token) {
			console.log('Erro no login: a API não retornou um token válido.');
			return fail(502, { message: 'A API não retornou um token de autenticação válido.' });
		}

		const cookieAttributes = setCookie?.split(';').slice(1).map((attribute) => attribute.trim()) ?? [];
		const maxAgeAttribute = cookieAttributes.find((attribute) => attribute.toLowerCase().startsWith('max-age='));
		const maxAge = maxAgeAttribute ? Number(maxAgeAttribute.slice('max-age='.length)) : undefined;

		cookies.set('auth_token', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: cookieAttributes.some((attribute) => attribute.toLowerCase() === 'secure'),
			...(maxAge !== undefined && Number.isFinite(maxAge) ? { maxAge } : {})
		});

		throw redirect(303, '/dashboard');
	}
};
