import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// Plugin pour copier .htaccess dans dist/
const copyHtaccess = () => {
  return {
    name: 'copy-htaccess',
    closeBundle() {
      try {
        copyFileSync(
          join(__dirname, '.htaccess'),
          join(__dirname, 'dist', '.htaccess')
        )
        console.log('✅ .htaccess copié dans dist/')
      } catch (err: any) {
        if (err.code !== 'ENOENT') {
          console.warn('⚠️  Impossible de copier .htaccess:', err.message)
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyHtaccess()],
  // Base public path - Changez selon votre déploiement
  // Pour la racine du domaine : base: '/'
  // Pour un sous-dossier : base: '/mon-app/'
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Séparer FullCalendar dans son propre chunk
          if (id.includes('@fullcalendar')) {
            return 'fullcalendar';
          }
          
          // Séparer Stripe dans son propre chunk
          if (id.includes('@stripe')) {
            return 'stripe';
          }
          
          // Séparer React et React DOM dans un chunk vendor
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          
          // Regrouper les autres node_modules dans un chunk vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Augmenter la limite d'avertissement pour les chunks
    chunkSizeWarningLimit: 1000,
  },
})
