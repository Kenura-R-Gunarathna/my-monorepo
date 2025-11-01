import { contextBridge } from 'electron'
import { createIPCRenderer } from 'trpc-electron/renderer'
import type { AppRouter } from '../main/trpc'

// Create tRPC client
const trpc = createIPCRenderer<AppRouter>()

// Expose tRPC client to renderer
contextBridge.exposeInMainWorld('trpc', trpc)
