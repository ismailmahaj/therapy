import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
