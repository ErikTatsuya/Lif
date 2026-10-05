<script lang="ts">
	import logo from '#lib/assets/logo.svg';

	let {
		href = '/',
		label = 'Lif',
		ariaLabel = `${label} — página inicial`,
		variant = 'default'
	}: {
		href?: string;
		label?: string;
		ariaLabel?: string;
		variant?: 'default' | 'sidebar';
	} = $props();
</script>

<a class="brand" class:sidebar={variant === 'sidebar'} {href} aria-label={ariaLabel}>
	<img src={logo} alt="" />
	<span>{label}</span>
</a>

<style>
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		color: #173326;
		font-size: 1.75rem;
		font-weight: 750;
		letter-spacing: -0.06em;
		text-decoration: none;
	}

	.brand img {
		width: 2.75rem;
		height: 2.75rem;
	}

	.brand.sidebar {
		color: #fff;
	}

	@media (max-width: 600px) {
		.brand {
			font-size: 1.5rem;
		}

		.brand img {
			width: 2.4rem;
			height: 2.4rem;
		}
	}
</style>
