import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  dolt: {
    checkInstalled: () => ipcRenderer.invoke('dolt:checkInstalled'),
    install: () => ipcRenderer.invoke('dolt:install'),
    init: () => ipcRenderer.invoke('dolt:init'),
    getInstalledVersion: () => ipcRenderer.invoke('dolt:getInstalledVersion'),
    query: (sql: string) => ipcRenderer.invoke('dolt:query', sql),
    commit: (message: string) => ipcRenderer.invoke('dolt:commit', message),
    push: () => ipcRenderer.invoke('dolt:push'),
    pull: () => ipcRenderer.invoke('dolt:pull'),
    getStatus: () => ipcRenderer.invoke('dolt:getStatus'),

    // Installation events
    onInstallProgress: (callback: (progress: number) => void) => {
      ipcRenderer.on('dolt:install:progress', (_, data) => callback(data))
    },
    onInstallStatus: (callback: (status: string) => void) => {
      ipcRenderer.on('dolt:install:status', (_, data) => callback(data))
    },
    onInstallComplete: (callback: () => void) => {
      ipcRenderer.on('dolt:install:complete', callback)
    },
    onInstallError: (callback: (error: string) => void) => {
      ipcRenderer.on('dolt:install:error', (_, data) => callback(data))
    }
  },

  migrations: {
    migrate: () => ipcRenderer.invoke('migrations:migrate'),
    rollback: () => ipcRenderer.invoke('migrations:rollback'),
    getStatus: () => ipcRenderer.invoke('migrations:getStatus')
  },

  seeders: {
    seed: (force?: boolean) => ipcRenderer.invoke('seeders:seed', force),
    getStatus: () => ipcRenderer.invoke('seeders:getStatus')
  },

  sync: {
    syncNow: () => ipcRenderer.invoke('sync:syncNow'),
    getStatus: () => ipcRenderer.invoke('sync:getStatus'),
    onSyncStart: (callback: () => void) => {
      ipcRenderer.on('sync:start', callback)
    },
    onSyncComplete: (callback: (data: Record<string, unknown>) => void) => {
      ipcRenderer.on('sync:complete', (_, data) => callback(data))
    },
    onSyncError: (callback: (error: Error) => void) => {
      ipcRenderer.on('sync:error', (_, data) => callback(data.message))
    },
    onStatus: (callback: (status: string) => void) => {
      ipcRenderer.on('sync:status', (_, data) => callback(data))
    }
  },

  connection: {
    isOnline: () => ipcRenderer.invoke('connection:isOnline'),
    onOnline: (callback: () => void) => {
      ipcRenderer.on('connection:online', callback)
    },
    onOffline: (callback: () => void) => {
      ipcRenderer.on('connection:offline', callback)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
