<svelte:head>
	<title>Qlete | Lif</title>
</svelte:head>

<section class="qlete-page" aria-labelledby="qlete-heading">
	<a class="back-link" href="/dashboard?view=projects">Projetos</a>
	<h1 id="qlete-heading">Qlete</h1>
	<p>Este projeto será integrado ao Lif.</p>
	<span class="status">Em desenvolvimento</span>
</section>

<style>
	.qlete-page {
		width: min(100%, 42rem);
	}

	.back-link {
		display: inline-block;
		margin-bottom: 2rem;
		color: #20864c;
		font-size: 0.95rem;
		font-weight: 600;
		text-decoration: none;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.back-link:focus-visible {
		outline: 3px solid #78bd8a;
		outline-offset: 3px;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 4vw, 2.75rem);
		font-weight: 650;
		letter-spacing: -0.05em;
	}

	p {
		margin: 0.75rem 0 1.25rem;
		color: #52675a;
		line-height: 1.6;
	}

	.status {
		display: inline-flex;
		padding: 0.4rem 0.7rem;
		border-radius: 999px;
		background: #eaf4e9;
		color: #176e3d;
		font-size: 0.85rem;
		font-weight: 600;
	}
</style>
