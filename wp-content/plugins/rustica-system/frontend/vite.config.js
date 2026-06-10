import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin personalizado para inyectar CSS compiled (como Tailwind) en el bundle JS (IIFE)
const cssInjectedByJs = () => {
  return {
    name: 'css-injected-by-js',
    apply: 'build',
    enforce: 'post',
    generateBundle(options, bundle) {
      let cssCode = ''
      // Buscar el asset de CSS generado
      for (const [fileName, file] of Object.entries(bundle)) {
        if (fileName.endsWith('.css')) {
          cssCode += file.source
          delete bundle[fileName] // Eliminar archivo CSS del bundle final
        }
      }
      if (cssCode) {
        // Encontrar el chunk de entrada JS e inyectar el CSS dinámicamente
        for (const [fileName, file] of Object.entries(bundle)) {
          if (fileName.endsWith('.js') && file.type === 'chunk' && file.isEntry) {
            const injectCode = `(function(){const style = document.createElement('style');style.textContent = ${JSON.stringify(cssCode)};document.head.appendChild(style);})();`;
            file.code = injectCode + file.code;
          }
        }
      }
    }
  }
}

// Config base reutilizable — cada app se compila como IIFE auto-contenida
export function appConfig(entry, name) {
  return defineConfig({
    plugins: [react(), cssInjectedByJs()],
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
