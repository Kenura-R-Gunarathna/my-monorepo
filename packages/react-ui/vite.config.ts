import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      ignored: ['!**/node_modules/@krag/**']
    }
  },
  
  resolve: {
    alias: {
      '@/packages/react-ui': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ReactUI',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {  // ← Object, not array
        format: 'es',
        entryFileNames: 'index.js',
        // Fix: Only rename CSS, keep other assets with original names
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'index.css';
          }
          return '[name].[ext]'; // Keep images/fonts with original names
        }
      }
    },
    cssCodeSplit: false,
    cssMinify: true,
    sourcemap: true, // Helpful for debugging in consuming apps
  },
  
  // Optional: Better dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom'],
  }
})