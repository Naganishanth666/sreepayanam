import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'
import { seoPlugin } from './scripts/seoPlugin.js'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), seoPlugin({ ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env })],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
}))
