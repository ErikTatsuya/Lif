<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import Brand from '#lib/components/Brand.svelte';

	let { data }: PageProps = $props();

	const today = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(new Date());
</script>

<svelte:head>
	<title>Lif</title>
</svelte:head>

<main>
	<header class="topbar">
		<Brand label="Lif" />

		<nav aria-label="Navegação principal">
			<button class="dashboard" type="button" onclick={() => goto('/dashboard')}>Dashboard</button>
			<button class="login" type="button" onclick={() => goto('/login')}>Login</button>
			<button class="signup" type="button" onclick={() => goto('/signup')}>Sign up</button>
		</nav>
	</header>

	<section class="daily-event" aria-labelledby="daily-event-title">
		<p class="eyebrow">Lif · Dado diário</p>
		<h1 id="daily-event-title">Aconteceu neste dia</h1>
		<p class="date">{today}</p>

		{#if data.dailyEvent}
			<article class="event-card">
				<p class="event-year">{data.dailyEvent.year}</p>
				<h2>{data.dailyEvent.title}</h2>
				<p class="event-description">{data.dailyEvent.description}</p>
			</article>
		{:else}
			<p class="event-message" role="status">{data.dailyEventMessage}</p>
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

	main {
		position: relative;
		min-height: 100svh;
		overflow: hidden;
		isolation: isolate;
		background:
			radial-gradient(ellipse at 18% 8%, rgb(223 241 224 / 55%), transparent 37%),
			#f8faf6;
	}

	.topbar {
		position: relative;
		z-index: 1;
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem clamp(1.25rem, 6vw, 5.5rem);
	}

	.daily-event {
		position: relative;
		z-index: 1;
		width: min(100% - 2.5rem, 46rem);
		margin: clamp(2rem, 8vh, 5rem) auto 12rem;
		text-align: center;
	}

	.eyebrow {
		margin: 0 0 0.65rem;
		color: #20864c;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.daily-event h1 {
		margin: 0;
		color: #173326;
		font-size: clamp(2rem, 6vw, 3.5rem);
		letter-spacing: -0.045em;
	}

	.date {
		margin: 0.75rem 0 2rem;
		color: #52705d;
		font-size: 1.1rem;
		text-transform: capitalize;
	}

	.event-card {
		padding: clamp(1.5rem, 5vw, 2.5rem);
		border: 1px solid rgb(56 137 79 / 14%);
		border-radius: 1.5rem;
		background: rgb(255 255 255 / 78%);
		box-shadow: 0 1.5rem 4rem rgb(38 82 49 / 9%);
		text-align: left;
		backdrop-filter: blur(12px);
	}

	.event-year {
		margin: 0 0 0.6rem;
		color: #20864c;
		font-size: 0.9rem;
		font-weight: 700;
	}

	.event-card h2 {
		margin: 0;
		color: #173326;
		font-size: clamp(1.35rem, 4vw, 2rem);
		letter-spacing: -0.025em;
	}

	.event-description,
	.event-message {
		color: #52705d;
		font-size: 1rem;
		line-height: 1.7;
	}

	.event-description {
		margin: 1rem 0 0;
	}

	.event-message {
		margin: 0 auto;
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
		background: radial-gradient(circle at 35% 35%, rgb(199 232 202 / 60%), rgb(222 240 221 / 16%) 68%, transparent 70%);
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

	nav {
		display: flex;
		align-items: center;
		gap: clamp(1rem, 3vw, 2rem);
	}

	nav button {
		border: 0;
		font: inherit;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 160ms ease,
			color 160ms ease,
			transform 160ms ease;
	}

	.login {
		padding: 0;
		color: #315442;
		background: transparent;
	}

	.dashboard {
		padding: 0;
		color: #315442;
		background: transparent;
	}

	.dashboard:hover {
		color: #168345;
	}

	.login:hover {
		color: #168345;
	}

	.signup {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		background: #20864c;
		color: #fff;
		min-height: 2.75rem;
		padding: 0 1.35rem;
		transition:
			background-color 160ms ease,
			transform 160ms ease;
	}

	.signup:hover {
		transform: translateY(-2px);
		background: #176e3d;
	}

	nav button:focus-visible {
		outline: 3px solid #78bd8a;
		outline-offset: 3px;
	}

	@media (max-width: 600px) {
		.topbar {
			padding: 1.1rem clamp(1.25rem, 6vw, 5.5rem);
		}

		nav {
			gap: 1rem;
		}

		nav button {
			font-size: 0.875rem;
		}

		.signup {
			min-height: 2.5rem;
			padding: 0 1rem;
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