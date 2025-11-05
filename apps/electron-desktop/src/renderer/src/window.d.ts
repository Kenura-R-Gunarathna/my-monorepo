// Type definitions for window.api exposed by preload script

export interface DoltAPI {
  checkInstalled: () => Promise<boolean>
  install: () => Promise<{ success: boolean; error?: string }>
  init: () => Promise<{ success: boolean; error?: string }>
  query: (sql: string) => Promise<{ success: boolean; data?: unknown; error?: string }>
  commit: (message: string) => Promise<{ success: boolean; data?: unknown; error?: string }>
  push: () => Promise<{ success: boolean; data?: unknown; error?: string }>
  pull: () => Promise<{ success: boolean; data?: unknown; error?: string }>
  getStatus: () => Promise<{ success: boolean; data?: unknown; error?: string }>
  onInstallProgress: (callback: (percent: number) => void) => () => void
  onInstallStatus: (callback: (status: string) => void) => () => void
  onInstallComplete: (callback: () => void) => () => void
  onInstallError: (callback: (error: string) => void) => () => void
}

export interface MigrationsAPI {
  migrate: () => Promise<{ success: boolean; data?: unknown; error?: string }>
  rollback: () => Promise<{ success: boolean; data?: unknown; error?: string }>
  getStatus: () => Promise<{ success: boolean; data?: unknown; error?: string }>
}

export interface SeedersAPI {
  seed: (force?: boolean) => Promise<{ success: boolean; data?: unknown; error?: string }>
  getStatus: () => Promise<{ success: boolean; data?: unknown; error?: string }>
}

export interface SyncAPI {
  syncNow: () => Promise<{ success: boolean; data?: unknown; error?: string }>
  getStatus: () => Promise<{ success: boolean; data?: unknown; error?: string }>
  onSyncStart: (callback: () => void) => () => void
  onSyncComplete: (callback: (status: Record<string, unknown>) => void) => () => void
  onSyncError: (callback: (error: string) => void) => () => void
  onConflicts: (callback: (conflicts: Record<string, unknown>[]) => void) => () => void
  onStatus: (callback: (status: string) => void) => () => void
}

export interface ConnectionAPI {
  isOnline: () => Promise<boolean>
  onOnline: (callback: () => void) => () => void
  onOffline: (callback: () => void) => () => void
}

declare global {
  interface Window {
    api: {
      dolt: DoltAPI
      migrations: MigrationsAPI
      seeders: SeedersAPI
      sync: SyncAPI
      connection: ConnectionAPI
    }
  }
}

export {}
