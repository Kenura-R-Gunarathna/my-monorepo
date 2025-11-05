import Store from 'electron-store'

export interface AppSettings {
  theme: 'light' | 'dark' | 'system' // Flattened for easy access
  language: string
  notifications: boolean
  autoSync: boolean
  syncInterval: number // minutes
  lastSyncAt: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preferences: Record<string, any>

  // Dolt-specific settings
  dolt: {
    remoteUrl: string
    branch: string
    username: string
    conflictResolution: 'ours' | 'theirs' | 'manual'
  }

  // Offline queue settings
  offline: {
    enabled: boolean
    maxQueueSize: number
    retryAttempts: number
    retryDelay: number
  }
}

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'en',
  notifications: true,
  autoSync: true,
  syncInterval: 5,
  lastSyncAt: 0,
  preferences: {},
  dolt: {
    remoteUrl: '',
    branch: 'main',
    username: '',
    conflictResolution: 'manual'
  },
  offline: {
    enabled: true,
    maxQueueSize: 1000,
    retryAttempts: 3,
    retryDelay: 5000
  }
}

export class SettingsManager {
  private store: Store<AppSettings>

  constructor() {
    this.store = new Store<AppSettings>({
      defaults: defaultSettings,
      name: 'app-settings'
    })
  }

  /**
   * Get all settings
   */
  getAll(): AppSettings {
    return this.store.store
  }

  /**
   * Get specific setting
   */
  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.store.get(key)
  }

  /**
   * Set specific setting
   */
  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.store.set(key, value)
  }

  /**
   * Update nested setting
   */
  update(updates: Partial<AppSettings>): void {
    const current = this.getAll()
    this.store.store = { ...current, ...updates }
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.store.clear()
  }

  /**
   * Watch for changes
   */
  onChange(callback: (newValue: AppSettings, oldValue: AppSettings | undefined) => void): void {
    this.store.onDidAnyChange(callback)
  }

  /**
   * Theme helper methods (for compatibility with old tRPC API)
   */
  theme = {
    get: (): AppSettings['theme'] => {
      return this.get('theme')
    },
    set: (theme: AppSettings['theme']): void => {
      this.set('theme', theme)
    }
  }
}

// Export singleton instance
export const settingsManager = new SettingsManager()
