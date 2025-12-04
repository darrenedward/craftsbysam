
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Bundle all dependencies for production deployment
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'pdf-vendor': ['jspdf', 'jspdf-autotable']
        }
      }
    }
  }
});
