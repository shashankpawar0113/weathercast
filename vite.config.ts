import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { weatherApiPlugin } from './vite-plugin-weather-api';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    weatherApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
