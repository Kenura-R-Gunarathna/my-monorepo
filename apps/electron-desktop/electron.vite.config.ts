import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@krag/config-electron', '@krag/database-desktop', '@krag/database-core']
      })
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      // TanStack Router plugin must be placed before React plugin
      TanStackRouterVite({
        target: 'react',
        autoCodeSplitting: true
      }),
      react(),
      tailwindcss()
    ],
    css: {
      postcss: {
        plugins: []
      }
    }
  }
})
