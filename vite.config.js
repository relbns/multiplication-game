import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/multiplication-game/',
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom'
  },
})
