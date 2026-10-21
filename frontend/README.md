# Lif frontend

Aplicação web do Lif feita com React, TypeScript, Vite, React Router e Tailwind CSS v4.

## Desenvolvimento

```sh
npm install
npm run dev
```

Copie `frontend/.env.example` para `frontend/.env`. O Vite usa a porta `5173` e o host `127.0.0.1`; as URLs de desenvolvimento precisam manter esse host para que CORS e cookies funcionem:

```env
BACKEND_DEVELOPMENT_URL=http://127.0.0.1:3000
FRONTEND_DEVELOPMENT_URL=http://127.0.0.1:5173
```

As URLs efetivas `BACKEND_URL` e `FRONTEND_URL` são selecionadas a partir do modo do Vite: `npm run dev` usa `development` e `npm run build` usa `production`. Valores diferentes de `development` e `production` são rejeitados. O frontend chama diretamente `BACKEND_DEVELOPMENT_URL` ou `BACKEND_PRODUCTION_URL`; apenas o destino público necessário para as requisições é incluído no bundle.

## Build e preview

```sh
npm run build
npm run preview
```

O build de produção é gerado em `dist/`.

## Deploy na Vercel

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Configure na Vercel `BACKEND_PRODUCTION_URL` com a URL HTTPS do backend e `FRONTEND_PRODUCTION_URL` com a origem HTTPS real do frontend publicado. O modo do build seleciona produção; não defina `NODE_ENV` manualmente no frontend. Faça novo deploy após alterar as variáveis.

Em produção o navegador chama diretamente as rotas `/auth` e `/daytron` na URL definida em `BACKEND_PRODUCTION_URL`. Na Vercel, configure essa variável com a URL HTTPS do backend para o build de produção. No Render, configure `NODE_ENV=production`, `BACKEND_PRODUCTION_URL` e `FRONTEND_PRODUCTION_URL` com as URLs reais. O backend deve permitir a origem exata do frontend no CORS; as chamadas incluem credenciais, e o cookie HttpOnly usa `SameSite=None; Secure` em produção.
