<script lang="ts">
	import type { Snippet } from 'svelte';
	import Brand from './Brand.svelte';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<svelte:head>
	<title>{title} | Lif</title>
</svelte:head>

<main class="auth-page">
	<header class="topbar">
		<Brand />
	</header>

	<div class="circle circle-glow" aria-hidden="true"></div>
	<div class="circle circle-outline" aria-hidden="true"></div>

	<section class="auth-card" aria-labelledby="auth-title">
		<h1 id="auth-title">{title}</h1>
		{@render children()}
	</section>

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

	.auth-page {
		position: relative;
		display: flex;
		min-height: 100svh;
		flex-direction: column;
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
		padding: 1.5rem clamp(1.25rem, 6vw, 5.5rem);
	}

	.auth-card {
		z-index: 1;
		width: min(100% - 2.5rem, 27rem);
		margin: auto;
		padding: clamp(1.5rem, 5vw, 2.5rem);
		border: 1px solid rgb(31 92 51 / 9%);
		border-radius: 1.25rem;
		background: rgb(255 255 255 / 90%);
		box-shadow: 0 1.5rem 5rem rgb(35 83 47 / 9%);
		backdrop-filter: blur(12px);
	}

	.auth-card h1 {
		margin: 0 0 1.75rem;
		font-size: 1.75rem;
		font-weight: 650;
		letter-spacing: -0.05em;
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

	:global(.auth-form) {
		display: grid;
		gap: 1rem;
	}

	:global(.auth-field) {
		display: grid;
		gap: 0.45rem;
		color: #315442;
		font-size: 0.9rem;
		font-weight: 600;
	}

	:global(.auth-input) {
		width: 100%;
		min-height: 2.9rem;
		padding: 0.7rem 0.85rem;
		border: 1px solid #d7e2d8;
		border-radius: 0.6rem;
		outline: none;
		background: #fff;
		color: #173326;
		font: inherit;
		font-size: 1rem;
		transition:
			border-color 160ms ease,
			box-shadow 160ms ease;
	}

	:global(.auth-input:focus) {
		border-color: #4b9c61;
		box-shadow: 0 0 0 3px rgb(75 156 97 / 15%);
	}

	:global(.submit-button) {
		display: inline-flex;
		min-height: 2.9rem;
		align-items: center;
		justify-content: center;
		margin-top: 0.35rem;
		padding: 0.7rem 1rem;
		border: 0;
		border-radius: 999px;
		background: #20864c;
		color: #fff;
		font: inherit;
		font-size: 0.95rem;
		font-weight: 650;
		cursor: pointer;
		transition:
			background-color 160ms ease,
			transform 160ms ease;
	}

	:global(.submit-button:hover) {
		transform: translateY(-1px);
		background: #176e3d;
	}

	:global(.submit-button:focus-visible),
	:global(.auth-link:focus-visible) {
		outline: 3px solid #78bd8a;
		outline-offset: 3px;
	}

	:global(.auth-message) {
		margin: 0;
		color: #a52d2d;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	:global(.auth-message.success) {
		color: #176e3d;
	}

	:global(.auth-switch) {
		margin: 1.25rem 0 0;
		color: #65776b;
		font-size: 0.9rem;
		text-align: center;
	}

	:global(.auth-link) {
		color: #20864c;
		font-weight: 650;
		text-decoration: none;
	}

	:global(.auth-link:hover) {
		text-decoration: underline;
	}

	@media (max-width: 600px) {
		.topbar {
			padding: 1.1rem 1.25rem;
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
