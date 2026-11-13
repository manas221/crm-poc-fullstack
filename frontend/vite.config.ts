import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => {
  // VITE_API_URL is baked in at build time. Without it, API calls would go to the static
  // site itself and its SPA rewrite would answer them with index.html, so fail loudly.
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (command === 'build' && !env.VITE_API_URL) {
    throw new Error('VITE_API_URL must be set for production builds (e.g. https://contacts-api.onrender.com)');
  }

  return {
    plugins: [react(), tailwindcss()],
    server: { port: 5173 },
  };
});
