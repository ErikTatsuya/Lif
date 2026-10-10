import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { authApiUrl, getAuthError } from '../../lib/server/auth';

export const actions: Actions = {
	default: async ({ request, fetch, platform }) => {
		const formData = await request.formData();
		const username = String(formData.get('username') ?? '').trim();
		const name = String(formData.get('name') ?? '').trim();
		const email = String(formData.get('email') ?? '').trim();
		const password = String(formData.get('password') ?? '');

		if (!username || !name || !email || !password) {
			return fail(400, { message: 'Preencha todos os campos.' });
		}

		let response: Response;
		try {
			response = await fetch(authApiUrl('signup', platform?.env), {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ username, name, email, password })
			});
		} catch (cause) {
			console.log('Erro ao conectar com a API de cadastro:', cause);
			return fail(503, { message: 'Não foi possível conectar à API. Tente novamente.' });
		}

		if (!response.ok) {
			const message = await getAuthError(response, 'Não foi possível criar a conta. Tente novamente.');
			console.log('Erro no cadastro:', message);
			return fail(response.status, {
				message
			});
		}

		return { success: 'Conta criada. Agora você pode entrar.' };
	}
};
