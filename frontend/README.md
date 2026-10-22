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
VITE_API_URL=http://127.0.0.1:3000
```

As URLs efetivas `BACKEND_URL` e `FRONTEND_URL` são selecionadas a partir do modo do Vite: `npm run dev` usa `development` e `npm run build` usa `production`. Valores diferentes de `development` e `production` são rejeitados. `VITE_API_URL` configura a URL direta do backend usada pelo navegador e pode ser omitida para usar `BACKEND_DEVELOPMENT_URL` ou `BACKEND_PRODUCTION_URL` conforme o modo. Todas as chamadas incluem cookies (`credentials: 'include'`); o Fastify e o frontend são servidos separadamente.

O Qlete está disponível em `/qlete`. A lista, visualização e resolução são públicas; para criar um quiz, entre e importe um JSON em `/qlete/new`. A plataforma Vercel já reescreve rotas do frontend para `index.html`, permitindo recarregar URLs como `/qlete/q/abc12345`.

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
- Configure na Vercel `BACKEND_PRODUCTION_URL` com a URL HTTPS do backend e `FRONTEND_PRODUCTION_URL` com a origem HTTPS real do frontend publicado. Configure `VITE_API_URL` com o mesmo backend HTTPS (ou deixe-a ausente para usar `BACKEND_PRODUCTION_URL`). O modo do build seleciona produção; não defina `NODE_ENV` manualmente no frontend. Faça novo deploy após alterar as variáveis.

Em produção o navegador chama diretamente as rotas `/auth`, `/daytron` e `/qlete` na URL definida em `VITE_API_URL` ou `BACKEND_PRODUCTION_URL`. No backend, configure `NODE_ENV=production`, `FRONTEND_ORIGIN` com a origem HTTPS exata do frontend e as URLs existentes. As chamadas incluem credenciais, e o cookie HttpOnly usa `SameSite=None; Secure` em produção.
