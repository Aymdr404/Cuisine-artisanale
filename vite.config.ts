import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@contexts': '/src/contexts',
      '@assets': '/src/assets',
      '@firebaseModule': path.resolve(__dirname, 'src/firebase')
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
  base: '/Recettes-cuisine/',

});
