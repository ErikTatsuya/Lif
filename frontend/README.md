# Lif frontend

Aplicação web do Lif feita com React, TypeScript, Vite, React Router e Tailwind CSS v4.

## Desenvolvimento

```sh
npm install
npm run dev
```

Copie `frontend/.env.example` para `frontend/.env` e configure a URL do backend:

```env
VITE_API_BASE_URL=http://127.0.0.1:3000
```

O cliente também aceita `API_BASE_URL` para compatibilidade, mas `VITE_API_BASE_URL` é a opção recomendada pelo Vite. A URL pode terminar ou não com `/`.

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
- Configure `VITE_API_BASE_URL` nas variáveis de ambiente da Vercel e faça novo deploy.

As chamadas de autenticação incluem credenciais do navegador. Configure no backend `FRONTEND_ORIGIN` com a origem exata da aplicação publicada e habilite cookies/credenciais nesse domínio. Se frontend e API estiverem em sites diferentes, a política `SameSite` do cookie também precisa permitir esse fluxo; o frontend não altera nem pode sobrescrever essa política do backend.
