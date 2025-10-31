import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the electron-store through the main process
contextBridge.exposeInMainWorld('electronAPI', {
  // User session management
  setUserSession: (sessionData: any) => ipcRenderer.invoke('set-user-session', sessionData),
  getUserSession: () => ipcRenderer.invoke('get-user-session'),
  clearUserSession: () => ipcRenderer.invoke('clear-user-session'),
  
  // Theme management
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme: 'light' | 'dark' | 'system') => ipcRenderer.invoke('set-theme', theme),
  
  // App info
  getPlatform: () => 'electron' as const,
});

// TypeScript type definitions for window.electronAPI
export interface ElectronAPI {
  setUserSession: (sessionData: any) => Promise<void>;
  getUserSession: () => Promise<any>;
  clearUserSession: () => Promise<void>;
  getTheme: () => Promise<'light' | 'dark' | 'system'>;
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  getPlatform: () => 'electron';
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
