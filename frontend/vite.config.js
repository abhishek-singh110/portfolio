import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local RAG backend (see ../backend). Override with VITE_CHAT_API for a deployed backend.
const api = { '/api': { target: 'http://localhost:8000', changeOrigin: true } }

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { proxy: api },
  preview: { proxy: api },
})
