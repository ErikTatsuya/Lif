<script lang="ts">
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import Brand from '#lib/components/Brand.svelte';
	import person from '#lib/assets/person.svg';

	let { data }: PageProps = $props();
	let showingProjects = $derived(page.url.searchParams.get('view') === 'projects');
	let profileOpen = $state(false);
	let logoutConfirmation = $state(false);
	let profileMenu: HTMLDivElement | undefined = $state();

	function closeProfile() {
		profileOpen = false;
		logoutConfirmation = false;
	}

	function handleOutsideClick(event: PointerEvent) {
		if (event.target instanceof Node && profileMenu && !profileMenu.contains(event.target)) {
			closeProfile();
		}
	}
</script>

<svelte:head>
	<title>Dashboard | Lif</title>
</svelte:head>

<svelte:window onpointerdown={handleOutsideClick} />

<div class="dashboard-layout">
	<aside class="sidebar">
		<Brand label="Lif-Labs" variant="sidebar" />
		<nav aria-label="Navegação principal">
			<a class:active={!showingProjects} href="/dashboard" aria-current={!showingProjects ? 'page' : undefined}>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" />
				</svg>
				Dashboard
			</a>
			<a class:active={showingProjects} href="/dashboard?view=projects" aria-current={showingProjects ? 'page' : undefined}>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<rect x="3" y="4" width="8" height="7" rx="1.5" />
					<rect x="13" y="4" width="8" height="7" rx="1.5" />
					<rect x="3" y="13" width="8" height="7" rx="1.5" />
					<rect x="13" y="13" width="8" height="7" rx="1.5" />
				</svg>
				Projetos
			</a>
		</nav>
	</aside>

	<main class="dashboard-main">
		<header class="topbar">
			<div class="profile-menu" bind:this={profileMenu}>
				<button
					class="profile-button"
					type="button"
					aria-label="Mostrar informações do perfil"
					aria-expanded={profileOpen}
					aria-controls="profile-panel"
					onclick={() => {
						if (profileOpen) closeProfile();
						else profileOpen = true;
					}}
				>
					<img src={person} alt="" />
				</button>

				{#if profileOpen}
					<section class="profile-panel" id="profile-panel" aria-label="Informações do perfil">
						<div class="panel-heading">
							<h2>Perfil</h2>
							<button
								class="close-button"
								type="button"
								aria-label="Fechar perfil"
								onclick={closeProfile}
							>
								<span aria-hidden="true">×</span>
							</button>
						</div>
						<dl>
							<div>
								<dt>Nome</dt>
								<dd>{data.profile.name}</dd>
							</div>
							<div>
								<dt>Nome de usuário</dt>
								<dd>@{data.profile.username}</dd>
							</div>
							<div>
								<dt>E-mail</dt>
								<dd>{data.profile.email}</dd>
							</div>
						</dl>
						{#if logoutConfirmation}
							<div class="logout-confirmation">
								<p>Tem certeza que deseja sair da conta?</p>
								<form method="POST" action="?/logout">
									<button class="confirm-logout-button" type="submit">Sim, sair da conta</button>
								</form>
								<button
									class="cancel-logout-button"
									type="button"
									onclick={() => (logoutConfirmation = false)}
								>
									Cancelar
								</button>
							</div>
						{:else}
							<button
								class="logout-button"
								type="button"
								onclick={() => (logoutConfirmation = true)}
							>
								<svg viewBox="0 0 24 24" aria-hidden="true">
									<path d="M10 17l5-5-5-5m5 5H3m9-9h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
								</svg>
								Sair da conta
							</button>
						{/if}
					</section>
				{/if}
			</div>
		</header>

		<section class="dashboard-content">
			{#if showingProjects}
				<h1>Projetos</h1>
				<div class="project-grid">
					<a class="project-card" href="/projects/qlete">
						<span class="project-icon" aria-hidden="true">
							<svg viewBox="0 0 24 24">
								<rect x="4" y="4" width="16" height="16" rx="3" />
								<path d="M8 9h8M8 13h5" />
							</svg>
						</span>
						<span class="project-details">
							<strong>Qlete</strong>
							<span>Em desenvolvimento</span>
							<span>Projeto Qlete integrado ao Lif.</span>
						</span>
						<svg class="open-project" viewBox="0 0 24 24" aria-hidden="true">
							<path d="M5 12h14m-6-6 6 6-6 6" />
						</svg>
					</a>
				</div>
			{:else}
				<h1>Dashboard</h1>
			{/if}
		</section>

		<div class="circle circle-glow" aria-hidden="true"></div>
		<div class="circle circle-outline" aria-hidden="true"></div>
		<svg class="wave" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
			<path
				class="wave-fill"
				d="M0 155 C180 65 270 65 450 155 S720 245 900 155 S1170 65 1440 155 V260 H0 Z"
			/>
			<path
				class="wave-line"
				d="M0 155 C180 65 270 65 450 155 S720 245 900 155 S1170 65 1440 155"
			/>
			<path
				class="wave-line wave-line-secondary"
				d="M0 190 C180 100 270 100 450 190 S720 280 900 190 S1170 100 1440 190"
			/>
		</svg>
	</main>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		color: #173326;
		background: #f8faf6;
	}

	.dashboard-layout {
		display: flex;
		min-height: 100svh;
	}

	.sidebar {
		z-index: 2;
		display: flex;
		width: 250px;
		flex: 0 0 250px;
		flex-direction: column;
		padding: 1.25rem;
		background: #1a1a1a;
		color: #fff;
	}

	.sidebar nav {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: 1.5rem;
	}

	.sidebar nav a {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem;
		border-radius: 0.6rem;
		color: #d7e2d8;
		font-size: 0.95rem;
		text-decoration: none;
		transition:
			background-color 160ms ease,
			color 160ms ease;
	}

	.sidebar nav a:hover,
	.sidebar nav a.active {
		background: #2b3a30;
		color: #78bd8a;
		font-weight: 650;
	}

	.sidebar nav a:focus-visible {
		outline: 3px solid #78bd8a;
		outline-offset: 2px;
	}

	.sidebar nav svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}

	.sidebar nav svg rect {
		fill: none;
	}

	.dashboard-main {
		position: relative;
		flex: 1;
		min-width: 0;
		min-height: 100svh;
		overflow: hidden;
		isolation: isolate;
		background:
			radial-gradient(ellipse at 18% 8%, rgb(223 241 224 / 55%), transparent 37%),
			#f8faf6;
	}

	.dashboard-content {
		position: relative;
		z-index: 1;
		padding: 1rem 2.5rem 3rem;
	}

	.dashboard-content h1 {
		margin: 0 0 1.5rem;
		font-size: clamp(2rem, 4vw, 2.75rem);
		font-weight: 650;
		letter-spacing: -0.05em;
	}

	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
		gap: 1.25rem;
	}

	.project-card {
		display: flex;
		min-height: 9rem;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px solid rgb(31 92 51 / 10%);
		border-radius: 1rem;
		background: rgb(255 255 255 / 92%);
		box-shadow: 0 1rem 3rem rgb(35 83 47 / 6%);
		color: inherit;
		text-decoration: none;
		transition:
			transform 160ms ease,
			box-shadow 160ms ease;
	}

	.project-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 1.25rem 3.5rem rgb(35 83 47 / 10%);
	}

	.project-card:focus-visible {
		outline: 3px solid #78bd8a;
		outline-offset: 3px;
	}

	.project-icon {
		display: grid;
		width: 3rem;
		height: 3rem;
		flex: 0 0 3rem;
		place-items: center;
		border-radius: 0.8rem;
		background: #eaf4e9;
		color: #20864c;
	}

	.project-icon svg,
	.open-project {
		width: 1.5rem;
		height: 1.5rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}

	.project-details {
		display: grid;
		min-width: 0;
		gap: 0.25rem;
	}

	.project-details strong {
		font-size: 1.05rem;
	}

	.project-details span {
		color: #65776b;
		font-size: 0.88rem;
	}

	.open-project {
		flex: 0 0 1.5rem;
		margin-left: auto;
		color: #65776b;
	}

	.topbar {
		position: relative;
		z-index: 2;
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: flex-end;
		padding: 1.5rem 2.5rem;
	}

	.profile-menu {
		position: relative;
	}

	.profile-button {
		display: grid;
		width: 2.75rem;
		height: 2.75rem;
		place-items: center;
		border: 1px solid rgb(32 134 76 / 15%);
		border-radius: 50%;
		background: #eaf4e9;
		cursor: pointer;
		transition:
			background-color 160ms ease,
			transform 160ms ease;
	}

	.profile-button:hover {
		transform: translateY(-1px);
		background: #dceedd;
	}

	.profile-button img {
		width: 1.5rem;
		height: 1.5rem;
	}

	.profile-button:focus-visible,
	.logout-button:focus-visible,
	.close-button:focus-visible,
	.confirm-logout-button:focus-visible,
	.cancel-logout-button:focus-visible {
		outline: 3px solid #78bd8a;
		outline-offset: 3px;
	}

	.profile-panel {
		position: absolute;
		top: calc(100% + 0.75rem);
		right: 0;
		width: min(19rem, calc(100vw - 2.5rem));
		padding: 1.25rem;
		border: 1px solid rgb(31 92 51 / 9%);
		border-radius: 1rem;
		background: #fff;
		box-shadow: 0 1rem 3rem rgb(35 83 47 / 12%);
	}

	.panel-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.profile-panel h2 {
		margin: 0;
		font-size: 1.1rem;
		letter-spacing: -0.03em;
	}

	.close-button {
		display: grid;
		width: 2rem;
		height: 2rem;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: #65776b;
		font: inherit;
		cursor: pointer;
	}

	.close-button:hover {
		background: #f0f6ef;
		color: #173326;
	}

	.close-button span {
		font-size: 1.5rem;
		line-height: 1;
	}

	dl {
		display: grid;
		gap: 0.85rem;
		margin: 0;
	}

	dl div {
		min-width: 0;
	}

	dt {
		margin-bottom: 0.2rem;
		color: #65776b;
		font-size: 0.78rem;
	}

	dd {
		overflow-wrap: anywhere;
		margin: 0;
		color: #173326;
		font-size: 0.92rem;
		font-weight: 600;
	}

	.profile-panel form {
		margin: 0;
	}

	.logout-button {
		display: flex;
		width: 100%;
		min-height: 2.5rem;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1.1rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid #f0dada;
		border-radius: 0.6rem;
		background: #fff7f6;
		color: #a52d2d;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.logout-button:hover {
		background: #fcebea;
	}

	.logout-button svg {
		width: 1.15rem;
		height: 1.15rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}

	.logout-confirmation {
		display: grid;
		gap: 0.6rem;
		margin-top: 1.1rem;
		padding-top: 1rem;
		border-top: 1px solid #e8eee8;
	}

	.logout-confirmation p {
		margin: 0 0 0.2rem;
		color: #8b2929;
		font-size: 0.88rem;
		font-weight: 600;
		line-height: 1.45;
	}

	.confirm-logout-button,
	.cancel-logout-button {
		width: 100%;
		min-height: 2.5rem;
		padding: 0.5rem 0.75rem;
		border: 0;
		border-radius: 0.6rem;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.confirm-logout-button {
		background: #a52d2d;
		color: #fff;
	}

	.confirm-logout-button:hover {
		background: #862323;
	}

	.cancel-logout-button {
		background: #f0f6ef;
		color: #315442;
	}

	.cancel-logout-button:hover {
		background: #e3f0e2;
	}

	.dashboard-content {
		position: relative;
		z-index: 1;
		width: min(100% - 5rem, 70rem);
		margin: 2.5rem auto 0;
	}

	.dashboard-content h1 {
		margin: 0;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 650;
		letter-spacing: -0.06em;
	}

	.circle {
		position: absolute;
		z-index: -1;
		border-radius: 50%;
		pointer-events: none;
	}

	.circle-glow {
		top: 17%;
		right: 9%;
		width: clamp(12rem, 30vw, 27rem);
		aspect-ratio: 1;
		background: radial-gradient(
			circle at 35% 35%,
			rgb(199 232 202 / 60%),
			rgb(222 240 221 / 16%) 68%,
			transparent 70%
		);
		filter: blur(1px);
	}

	.circle-outline {
		top: 11%;
		right: 5%;
		width: clamp(17rem, 41vw, 37rem);
		aspect-ratio: 1;
		border: 1px solid rgb(56 137 79 / 10%);
		box-shadow:
			0 0 0 2.5rem rgb(56 137 79 / 2%),
			0 0 0 5rem rgb(56 137 79 / 1.5%);
	}

	.wave {
		position: absolute;
		z-index: -1;
		right: 0;
		bottom: 0;
		left: 0;
		width: 100%;
		height: clamp(9rem, 24vw, 17rem);
		overflow: visible;
		pointer-events: none;
	}

	.wave-fill {
		fill: rgb(225 241 225 / 37%);
	}

	.wave-line {
		fill: none;
		stroke: rgb(51 134 75 / 20%);
		stroke-width: 1.5;
		vector-effect: non-scaling-stroke;
	}

	.wave-line-secondary {
		stroke: rgb(51 134 75 / 10%);
		stroke-width: 1;
	}

	@media (max-width: 600px) {
		.dashboard-layout {
			flex-direction: column;
		}

		.sidebar {
			width: 100%;
			flex: none;
			padding: 0.85rem 1.25rem;
		}

		.sidebar nav {
			flex-direction: row;
			gap: 0.35rem;
			margin-top: 0.75rem;
			overflow-x: auto;
		}

		.sidebar nav a {
			flex: 0 0 auto;
			padding: 0.65rem;
		}

		.dashboard-main {
			min-height: calc(100svh - 7.5rem);
		}

		.topbar {
			padding: 1.1rem 1.25rem;
		}

		.dashboard-content {
			padding: 1rem 1.25rem 2rem;
		}

		.circle-glow {
			top: 25%;
			right: -12%;
		}

		.circle-outline {
			top: 22%;
			right: -22%;
		}
	}
</style>
