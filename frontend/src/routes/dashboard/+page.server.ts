import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { authApiUrl } from '../../lib/server/auth';

type Profile = {
	name: string;
	username: string;
	email: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export const load: PageServerLoad = async ({ cookies, fetch, platform }) => {
	const token = cookies.get('auth_token');
	if (!token) redirect(303, '/login');

	let response: Response;
	try {
		response = await fetch(authApiUrl('me', platform?.env, platform !== undefined), {
			headers: { cookie: `auth_token=${encodeURIComponent(token)}` }
		});
	} catch (cause) {
		console.log('Erro ao verificar a sessão:', cause);
		error(503, 'Não foi possível verificar a sessão. Tente novamente.');
	}

	if (response.status === 401) {
		cookies.delete('auth_token', { path: '/' });
		redirect(303, '/login');
	}

	if (response.status === 429) {
		console.log('Erro ao verificar a sessão:', response.statusText);
		error(429, 'Muitas verificações de sessão. Tente novamente em instantes.');
	}

	if (!response.ok) {
		console.log('Erro ao carregar o perfil:', response.statusText);
		error(502, 'Não foi possível carregar o perfil.');
	}

	let body: unknown;
	try {
		body = await response.json();
	} catch (cause) {
		console.log('Erro ao ler a resposta da API:', cause);
		error(502, 'A API retornou uma resposta inválida.');
	}

	if (
		!isRecord(body) ||
		!isRecord(body.user) ||
		typeof body.user.name !== 'string' ||
		typeof body.user.username !== 'string' ||
		typeof body.user.email !== 'string'
	) {
		console.log('Erro: a API retornou dados de perfil inválidos.');
		error(502, 'A API retornou dados de perfil inválidos.');
	}

	const profile: Profile = {
		name: body.user.name,
		username: body.user.username,
		email: body.user.email
	};

	return { profile };
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete('auth_token', { path: '/' });
		redirect(303, '/');
	}
};
