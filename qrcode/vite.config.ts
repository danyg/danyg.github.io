import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths so the built index.html references local assets
  base: './',
  build: {
    outDir: 'build',   // temporary build dir
    assetsDir: 'assets',
    emptyOutDir: true
  }
})
