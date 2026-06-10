import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración estándar de Vite para compilar el Single Page Application independiente
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-spa',
    emptyOutDir: true,
  }
})
