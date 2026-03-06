import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  publicDir: false, // Don't copy public dir (we're already in it)
  build: {
    outDir: '../dist-frontend',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // HTML entry points
        main: resolve(__dirname, 'public/manager.html'),
        login: resolve(__dirname, 'public/login.html'),
      },
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Minify for production
    minify: 'esbuild',
  },
  server: {
    port: 3001,
    // Proxy API calls to Express backend
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './public/js'),
      '@components': resolve(__dirname, './public/js/components'),
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['lit'],
  },
});
