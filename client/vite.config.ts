import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Read version from package.json
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
let version = pkg.version || '0.1.0';

// Try to read version from .version file (optional, fallback to package.json)
try {
  // Check both current dir (Docker) and parent dir (Local Dev)
  const versionPaths = [
    path.resolve(__dirname, '.version'),
    path.resolve(__dirname, '../.version')
  ];
  
  for (const vPath of versionPaths) {
    if (fs.existsSync(vPath)) {
      version = fs.readFileSync(vPath, 'utf-8').trim();
      break;
    }
  }
} catch (error) {
  // Ignore errors, use package.json version
}

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
