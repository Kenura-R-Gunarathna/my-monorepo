import { BrowserWindow } from 'electron'
import { createIPCHandler } from 'trpc-electron/main'
import { appRouter } from './index'

export function setupTRPCHandler(): void {
  createIPCHandler({
    router: appRouter,
    windows: BrowserWindow.getAllWindows()
  })
}
