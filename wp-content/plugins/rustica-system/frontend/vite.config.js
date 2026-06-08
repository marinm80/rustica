import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Config base reutilizable — cada app se compila como IIFE auto-contenida
export function appConfig(entry, name) {
  return defineConfig({
    plugins: [react()],
    build: {
      lib: {
        entry,
        formats: ['iife'],
        name,
        fileName: () => `${name.replace('Rustica', '').toLowerCase()}.js`,
      },
      outDir: '../assets/dist',
      emptyOutDir: false,
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  })
}

export default appConfig('src/entries/reservas.jsx', 'RusticaReservas')
