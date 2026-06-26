import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/.electron-user-data/**', '**/.npm-cache/**', '**/.puppeteer-cache/**'],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
