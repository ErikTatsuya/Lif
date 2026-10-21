# Lif frontend

Aplicação web do Lif feita com React, TypeScript, Vite, React Router e Tailwind CSS v4.

## Desenvolvimento

```sh
npm install
npm run dev
```

Copie `frontend/.env.example` para `frontend/.env`. O Vite usa a porta `5173` e o host `127.0.0.1`; as URLs de desenvolvimento precisam manter esse host para que CORS e cookies funcionem:

```env
NODE_ENV=development
BACKEND_DEVELOPMENT_URL=http://127.0.0.1:3000
FRONTEND_DEVELOPMENT_URL=http://127.0.0.1:5173
```

As URLs efetivas `BACKEND_URL` e `FRONTEND_URL` são selecionadas a partir de `NODE_ENV`. Valores diferentes de `development` e `production` são rejeitados. O Vite injeta no cliente somente o destino de API necessário: em desenvolvimento ele aponta para o backend configurado e em produção aponta para `/api`.

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
- Configure na Vercel `NODE_ENV=production`, `BACKEND_PRODUCTION_URL` com a URL HTTPS do backend e `FRONTEND_PRODUCTION_URL` com a origem HTTPS real do frontend publicado. Faça novo deploy após alterar as variáveis.

Em produção o navegador chama o proxy same-origin `/api`, que encaminha as rotas de autenticação e eventos para `BACKEND_PRODUCTION_URL` sem incluir a URL do backend no bundle do frontend. No Render, configure `NODE_ENV=production`, `BACKEND_PRODUCTION_URL` e `FRONTEND_PRODUCTION_URL` com as URLs reais. O backend usa a origem do frontend para CORS e envia o cookie HttpOnly com `SameSite=None; Secure` em produção.
