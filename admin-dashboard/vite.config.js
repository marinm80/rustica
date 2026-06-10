import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@rustica-apps': path.resolve(__dirname, '../wp-content/plugins/rustica-system/frontend/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    fs: { allow: ['..'] },
    proxy: {
      '/wp-json': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    alias: {
      '@rustica-apps/apps/MeseroApp': path.resolve(__dirname, './src/test/stubs/apps/MeseroApp.jsx'),
      '@rustica-apps/apps/CocinaApp': path.resolve(__dirname, './src/test/stubs/apps/CocinaApp.jsx'),
      '@rustica-apps/apps/ReservasApp': path.resolve(__dirname, './src/test/stubs/apps/ReservasApp.jsx'),
      '@rustica-apps': path.resolve(__dirname, './src/test/stubs'),
    },
  },
})
