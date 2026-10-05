<script lang="ts">
	import type { LayoutProps } from './$types';
	import Brand from '#lib/components/Brand.svelte';

	let { children }: LayoutProps = $props();
</script>

<div class="projects-shell">
	<aside class="sidebar">
		<Brand label="Lif-Labs" variant="sidebar" />
		<nav aria-label="Navegação principal">
			<a href="/dashboard">
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" />
				</svg>
				Dashboard
			</a>
			<a class="active" href="/dashboard?view=projects" aria-current="page">
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

	<main class="projects-main">
		{@render children()}
	</main>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: #f8faf6;
		color: #173326;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	}

	.projects-shell {
		display: flex;
		min-height: 100svh;
		background:
			radial-gradient(ellipse at 18% 8%, rgb(223 241 224 / 55%), transparent 37%),
			#f8faf6;
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

	nav {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: 1.5rem;
	}

	nav a {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem;
		border-radius: 0.6rem;
		color: #d7e2d8;
		font-size: 0.95rem;
		text-decoration: none;
	}

	nav a:hover,
	nav a.active {
		background: #2b3a30;
		color: #78bd8a;
		font-weight: 650;
	}

	nav a:focus-visible {
		outline: 3px solid #78bd8a;
		outline-offset: 3px;
	}

	nav svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}

	nav svg rect {
		fill: none;
	}

	.projects-main {
		flex: 1;
		min-width: 0;
		padding: clamp(2rem, 6vw, 5rem);
	}

	@media (max-width: 600px) {
		.projects-shell {
			flex-direction: column;
		}

		.sidebar {
			width: 100%;
			flex: none;
			padding: 0.85rem 1.25rem;
		}

		nav {
			flex-direction: row;
			margin-top: 0.75rem;
		}

		.projects-main {
			padding: 2rem 1.25rem;
		}
	}
</style>
