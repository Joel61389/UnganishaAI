import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/chat': { target: 'http://localhost:8000', changeOrigin: true },
      '/profile': { target: 'http://localhost:8000', changeOrigin: true },
      '/matches': { target: 'http://localhost:8000', changeOrigin: true },
      '/introductions': { target: 'http://localhost:8000', changeOrigin: true },
      '/feedback': { target: 'http://localhost:8000', changeOrigin: true },
      '/analytics': { target: 'http://localhost:8000', changeOrigin: true },
    }
  }
})
