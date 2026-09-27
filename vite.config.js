import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/UMNG_Cuento_Acentos/',
  plugins: [react()],
  // Vite no incluye .glb en sus tipos de asset por defecto, sin esto el
  // import del modelo falla al resolver.
  assetsInclude: ['**/*.glb'],
})
