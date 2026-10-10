<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import AuthShell from '#lib/components/AuthShell.svelte';

	let { form, data }: PageProps = $props();
</script>

<AuthShell title="Login">
	{#if data.isAlreadyLoggedIn}
		<p class="auth-message success" role="status">
			Você já está logado.
			<a class="auth-link" href="/dashboard">Ir para o dashboard</a>
		</p>
	{:else if data.sessionCheckMessage}
		<p class="auth-message" role="alert">{data.sessionCheckMessage}</p>
	{/if}

	<form
		class="auth-form"
		method="POST"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'failure') {
					console.log('Erro no login:', result.data?.message);
					console.log(
						'Resposta recebida da API:',
						JSON.stringify(result.data?.apiResponse, null, 2)
					);
				} else if (result.type === 'error') {
					console.log('Erro inesperado no login:', result.error);
				}

				await update();
			};
		}}
	>
		<label class="auth-field">
			Usuário ou e-mail
			<input
				class="auth-input"
				name="identifier"
				type="text"
				autocomplete="username"
				required
			/>
		</label>

		<label class="auth-field">
			Senha
			<input
				class="auth-input"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			/>
		</label>

		{#if form?.message}
			<p class="auth-message" role="alert">{form.message}</p>
		{/if}

		<button class="submit-button" type="submit">Entrar</button>
	</form>

	<p class="auth-switch">
		Ainda não tem conta?
		<a class="auth-link" href="/signup">Criar conta</a>
	</p>
</AuthShell>
