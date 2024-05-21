import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist', // Ensure this is set to the correct directory
    chunkSizeWarningLimit: 10000, // Increase the limit to 1000 kB or another suitable value
    sourcemap: false,
  },
});
