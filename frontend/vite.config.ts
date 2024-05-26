import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
  },
  build: {
    chunkSizeWarningLimit: 10000,
    outDir: 'dist', // This specifies the output directory
    sourcemap: false,
  }
})
