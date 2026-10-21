# lif

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm run dev
```

Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`. Configure `NODE_ENV` as `development` or `production` and set the frontend/backend URLs for both environments. The backend selects `BACKEND_URL` and `FRONTEND_URL` from the matching environment; the frontend URL is used as the credentialed CORS origin. Local development uses `http://127.0.0.1:5173` for Vite and `http://127.0.0.1:3000` for the API.

Build and run in production:

```bash
npm run build
npm start
```

For deployment, set `NODE_ENV=production`, `BACKEND_PRODUCTION_URL`, and `FRONTEND_PRODUCTION_URL` in the hosting provider's environment configuration. Do not commit `.env` or real credentials.
