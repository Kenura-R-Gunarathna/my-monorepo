import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ReactUI'
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: [
        {
          format: 'es',
          entryFileNames: 'index.js',
          assetFileNames: 'index.css'
        }
      ]
    },
    cssCodeSplit: false,
    cssMinify: true
  }
})
