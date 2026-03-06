import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  publicDir: '../public',
  build: {
    outDir: '../dist-frontend',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/manager.html'),
        login: resolve(__dirname, 'public/login.html'),
      },
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
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
});
