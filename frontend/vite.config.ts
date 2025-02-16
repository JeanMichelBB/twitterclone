import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Update your Vite config
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
  },
  build: {
    chunkSizeWarningLimit: 10000,
    outDir: 'dist', // This specifies the output directory
    sourcemap: false,
  },
  define: {
    // If you want to ensure specific env variables are exposed (usually not necessary for VITE_ prefixed variables)
    'process.env.VITE_APP_API_KEY': JSON.stringify(process.env.VITE_APP_API_KEY),
    'process.env.VITE_APP_API_URL': JSON.stringify(process.env.VITE_APP_API_URL),
  }
})