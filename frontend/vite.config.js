import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({command}) => ({
  plugins: [react()],
  // base is '/tharun-fitness-track/' in production (GitHub Pages), '/' in dev
  base: command === 'build' ? '/tharun-fitness-track/' : '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
}))
