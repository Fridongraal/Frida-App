import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Crucial for Electron to load compiled assets with relative paths
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    strictPort: true,
  }
});
