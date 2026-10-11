import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  envPrefix: ['VITE_', 'API_'],
  plugins: [react(), tailwindcss()]
});
