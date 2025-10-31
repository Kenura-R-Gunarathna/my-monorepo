import { ipcMain } from 'electron';
import {
  electronStore,
  userSessionCache,
  themeStore,
  clearAllStores,
} from '@krag/database-electron';

/**
 * Setup IPC handlers for electron-store operations
 * This should be called in the main process during app initialization
 */
export function setupStoreHandlers(): void {
  // User session handlers
  ipcMain.handle('set-user-session', async (_event, sessionData) => {
    try {
      userSessionCache.set(sessionData.user);
      return { success: true };
    } catch (error) {
      console.error('Failed to set user session:', error);
      throw error;
    }
  });

  ipcMain.handle('get-user-session', async () => {
    try {
      return userSessionCache.get();
    } catch (error) {
      console.error('Failed to get user session:', error);
      return null;
    }
  });

  ipcMain.handle('clear-user-session', async () => {
    try {
      userSessionCache.clear();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear user session:', error);
      throw error;
    }
  });

  // Theme handlers
  ipcMain.handle('get-theme', async () => {
    try {
      return themeStore.get();
    } catch (error) {
      console.error('Failed to get theme:', error);
      return 'system';
    }
  });

  ipcMain.handle('set-theme', async (_event, theme: 'light' | 'dark' | 'system') => {
    try {
      themeStore.set(theme);
      return { success: true };
    } catch (error) {
      console.error('Failed to set theme:', error);
      throw error;
    }
  });

  // Clear all data handler (for logout)
  ipcMain.handle('clear-all-stores', async () => {
    try {
      clearAllStores();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear all stores:', error);
      throw error;
    }
  });
}

/**
 * Cleanup handlers on app quit
 */
export function cleanupStoreHandlers(): void {
  ipcMain.removeHandler('set-user-session');
  ipcMain.removeHandler('get-user-session');
  ipcMain.removeHandler('clear-user-session');
  ipcMain.removeHandler('get-theme');
  ipcMain.removeHandler('set-theme');
  ipcMain.removeHandler('clear-all-stores');
}
