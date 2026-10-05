<script lang="ts">
	import type { PageProps } from './$types';
	import AuthShell from '#lib/components/AuthShell.svelte';

	let { form }: PageProps = $props();
</script>

<AuthShell title="Criar conta">
	{#if form?.success}
		<p class="auth-message success" role="status">{form.success}</p>
		<p class="auth-switch">
			<a class="auth-link" href="/login">Ir para login</a>
		</p>
	{:else}
		<form class="auth-form" method="POST">
			<label class="auth-field">
				Nome
				<input class="auth-input" name="name" type="text" autocomplete="name" required />
			</label>

			<label class="auth-field">
				Nome de usuário
				<input
					class="auth-input"
					name="username"
					type="text"
					autocomplete="username"
					required
				/>
			</label>

			<label class="auth-field">
				E-mail
				<input class="auth-input" name="email" type="email" autocomplete="email" required />
			</label>

			<label class="auth-field">
				Senha
				<input
					class="auth-input"
					name="password"
					type="password"
					autocomplete="new-password"
					minlength="8"
					maxlength="255"
					required
				/>
			</label>

			{#if form?.message}
				<p class="auth-message" role="alert">{form.message}</p>
			{/if}

			<button class="submit-button" type="submit">Criar conta</button>
		</form>

		<p class="auth-switch">
			Já tem uma conta?
			<a class="auth-link" href="/login">Entrar</a>
		</p>
	{/if}
</AuthShell>
