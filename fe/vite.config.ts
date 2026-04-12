import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __API_HTTP__: JSON.stringify(process.env.API_HTTP ?? ''),
  },
  server: {
    port: parseInt(process.env.VITE_PORT ?? '5173'),
    proxy: process.env.API_HTTP
      ? {
          '/api': { target: process.env.API_HTTP, changeOrigin: true },
          '/graphql': { target: process.env.API_HTTP, changeOrigin: true },
        }
      : undefined,
  },
})
