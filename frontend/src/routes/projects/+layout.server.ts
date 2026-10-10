import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { authApiUrl } from '../../lib/server/auth';

export const load: LayoutServerLoad = async ({ cookies, fetch, platform }) => {
	const token = cookies.get('auth_token');
	if (!token) redirect(303, '/login');

	let response: Response;
	try {
		response = await fetch(authApiUrl('me', platform?.env), {
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
		console.log('Erro ao validar acesso aos projetos:', response.statusText);
		error(502, 'Não foi possível validar o acesso aos projetos.');
	}
};
