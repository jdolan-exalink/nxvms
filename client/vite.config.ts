import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Read version from .version file
const version = fs.readFileSync(path.resolve(__dirname, '../.version'), 'utf-8').trim();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@auth': path.resolve(__dirname, './src/auth'),
      '@resources': path.resolve(__dirname, './src/resources'),
      '@layout': path.resolve(__dirname, './src/layout'),
      '@live-view': path.resolve(__dirname, './src/live-view'),
      '@playback': path.resolve(__dirname, './src/playback'),
      '@events': path.resolve(__dirname, './src/events'),
      '@bookmarks': path.resolve(__dirname, './src/bookmarks'),
      '@export': path.resolve(__dirname, './src/export'),
      '@health': path.resolve(__dirname, './src/health'),
      '@notifications': path.resolve(__dirname, './src/notifications'),
      '@permissions': path.resolve(__dirname, './src/permissions'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  base: './',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
});
