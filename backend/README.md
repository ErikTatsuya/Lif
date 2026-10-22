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

## Qlete

The Qlete API is registered at `/qlete` (the frontend calls the backend directly; there is no `/api` prefix). Public routes list and search quizzes, return quizzes without correct-answer flags, and grade submissions on the server:

- `GET /qlete/quizzes?q=biology&page=1`
- `GET /qlete/quizzes/:id`
- `POST /qlete/quizzes/:id/submit`
- Authenticated: `GET /qlete/me/quizzes`, `POST /qlete/quizzes/import`, `POST /qlete/quizzes`, `GET /qlete/quizzes/:id/edit`, `PUT /qlete/quizzes/:id`, `DELETE /qlete/quizzes/:id`

To apply the Qlete schema using Drizzle, run from `backend/`:

```sh
npm run db:migrate
```

After changing the Drizzle schema, generate a migration with `npm run db:generate`, review the SQL, and apply it with `npm run db:migrate`. The initial Qlete migration adds only `quizzes`, `questions`, and `options`; `users` and `events` are existing tables.

Quiz JSON import accepts `title` (required, max 160 characters), optional `description` (max 2,000), and at least one question. Each question has `prompt` (max 1,000), optional `explanation` (max 2,000), and at least two options. Each option has `text` (max 500) and a boolean `isCorrect`; at least one option per question must be correct. A quiz can contain at most 100 questions and each question at most 10 options. Example:

```json
{
  "title": "Biologia básica",
  "description": "Uma revisão de células",
  "questions": [
    {
      "prompt": "Qual estrutura contém o material genético?",
      "explanation": "O DNA fica principalmente no núcleo das células eucarióticas.",
      "options": [
        { "text": "Núcleo", "isCorrect": true },
        { "text": "Membrana plasmática", "isCorrect": false }
      ]
    }
  ]
}
```

Configure `FRONTEND_ORIGIN` with the exact frontend origin (scheme, host, and optional port, with no path) to override the environment-specific `FRONTEND_DEVELOPMENT_URL` / `FRONTEND_PRODUCTION_URL`. Credentialed CORS uses this exact origin. The existing auth cookie uses `SameSite=Lax` for development and `SameSite=None; Secure` for production; the production behavior already supports cross-site frontend/backend hosts over HTTPS.

Permission and answer-privacy integration tests use a dedicated migrated PostgreSQL database. Set `DATABASE_URL` to that database and run `npm run db:migrate`, then set `TEST_DATABASE_URL` to the same database and run `npm test` from `backend/`. The test creates and removes its own users and quizzes. Without `TEST_DATABASE_URL`, Node marks the integration test as skipped.
