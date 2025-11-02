import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { configSecurityPlugin } from '@krag/config/vite-plugin'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@krag/config', '@krag/drizzle-orm-client']
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
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true
      }),
      react(),
      tailwindcss(),
      configSecurityPlugin({
        serverModules: ['@krag/config/server', '@krag/config/client', '@krag/drizzle-orm-server'],
        clientPatterns: [
          /src\/renderer\//, // All renderer code is client-side
          /\.tsx?$/
        ],
        verbose: false
      })
    ],
    css: {
      postcss: {
        plugins: []
      }
    }
  }
})
