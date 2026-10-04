<script lang="ts">
    // Você pode trocar essas funções por navegação com SvelteKit depois.
    function signIn() {
        console.log("Sign in");
    }

    function signUp() {
        console.log("Sign up");
    }
</script>

<svelte:head>
    <title>Home</title>
    <meta
        name="description"
        content="Welcome to the application."
    />
</svelte:head>

<div class="page">
    <nav>
        <div class="logo">MyApp</div>

        <div class="nav-actions">
            <button class="signin" onclick={signIn}>
                Sign in
            </button>

            <button class="signup" onclick={signUp}>
                Sign up
            </button>
        </div>
    </nav>

    <main>
        <section class="hero">
            <div class="badge">Welcome</div>

            <h1>
                Build something
                <span>great.</span>
            </h1>

            <p>
                A simple, modern place to get started.
                Create your account and start exploring.
            </p>

            <div class="hero-actions">
                <button class="primary" onclick={signUp}>
                    Get started
                </button>

                <button class="secondary" onclick={signIn}>
                    Sign in
                </button>
            </div>
        </section>
    </main>
</div>

<style>
    :global(*) {
        box-sizing: border-box;
    }

    :global(body) {
        margin: 0;
        font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        background: #07100b;
        color: #f4faf5;
    }

    .page {
        min-height: 100vh;
        background:
            radial-gradient(
                circle at 50% 35%,
                rgba(34, 197, 94, 0.12),
                transparent 35%
            ),
            #07100b;
    }

    nav {
        height: 72px;
        padding: 0 7%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .logo {
        font-size: 20px;
        font-weight: 700;
        color: #4ade80;
    }

    .nav-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    button {
        font: inherit;
        cursor: pointer;
        border: none;
        transition:
            transform 0.15s ease,
            background 0.15s ease;
    }

    button:hover {
        transform: translateY(-1px);
    }

    .signin {
        padding: 9px 16px;
        background: transparent;
        color: #d8e5db;
    }

    .signin:hover {
        color: #4ade80;
    }

    .signup {
        padding: 9px 17px;
        border-radius: 8px;
        background: #22c55e;
        color: #06100a;
        font-weight: 600;
    }

    .signup:hover {
        background: #4ade80;
    }

    main {
        min-height: calc(100vh - 72px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 80px 24px;
    }

    .hero {
        max-width: 760px;
        text-align: center;
    }

    .badge {
        display: inline-block;
        padding: 6px 12px;
        margin-bottom: 24px;
        border: 1px solid rgba(74, 222, 128, 0.25);
        border-radius: 999px;
        background: rgba(34, 197, 94, 0.08);
        color: #4ade80;
        font-size: 13px;
        font-weight: 600;
    }

    h1 {
        margin: 0;
        font-size: clamp(48px, 8vw, 82px);
        line-height: 1;
        letter-spacing: -0.055em;
    }

    h1 span {
        color: #4ade80;
    }

    p {
        max-width: 560px;
        margin: 28px auto 0;
        color: #9aaa9e;
        font-size: 18px;
        line-height: 1.7;
    }

    .hero-actions {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 36px;
    }

    .primary {
        padding: 13px 22px;
        border-radius: 9px;
        background: #22c55e;
        color: #06100a;
        font-weight: 700;
    }

    .primary:hover {
        background: #4ade80;
    }

    .secondary {
        padding: 13px 22px;
        border: 1px solid #26352b;
        border-radius: 9px;
        background: #101a13;
        color: #dce8df;
        font-weight: 600;
    }

    .secondary:hover {
        background: #16221a;
        border-color: #36503e;
    }

    @media (max-width: 600px) {
        nav {
            padding: 0 20px;
        }

        .hero-actions {
            flex-direction: column;
        }

        .hero-actions button {
            width: 100%;
        }
    }
</style>