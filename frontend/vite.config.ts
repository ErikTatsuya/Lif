import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { resolveEnvironmentConfig } from './environment.ts';

export default defineConfig(({ mode }) => {
  const variables = loadEnv(mode, '.', '');
  const config = resolveEnvironmentConfig({ ...variables, NODE_ENV: mode }, mode);
  const frontendUrl = new URL(config.frontendUrl);

  return {
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(config.backendUrl)
    },
    plugins: [react(), tailwindcss()],
    server: config.environment === 'development'
      ? {
          host: frontendUrl.hostname,
          port: Number(frontendUrl.port || (frontendUrl.protocol === 'https:' ? 443 : 80)),
          strictPort: true
        }
      : undefined
  };
});
