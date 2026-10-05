import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { authApiUrl, getAuthError } from '../../lib/server/auth';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
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
			response = await fetch(authApiUrl('signup'), {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ username, name, email, password })
			});
		} catch {
			return fail(503, { message: 'Não foi possível conectar à API. Tente novamente.' });
		}

		if (!response.ok) {
			return fail(response.status, {
				message: await getAuthError(response, 'Não foi possível criar a conta. Tente novamente.')
			});
		}

		return { success: 'Conta criada. Agora você pode entrar.' };
	}
};
