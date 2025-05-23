import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    preserveSymlinks: true,
    caseSensitive: true
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    allowedHosts: [
      'nitt-e-fronted.onrender.com',
      '*.onrender.com', // Allow all onrender.com subdomains
      'localhost'
    ]
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    allowedHosts: [
      'nitt-e-fronted.onrender.com',
      '*.onrender.com', // Allow all onrender.com subdomains
      'localhost'
    ]
  }
})