import { createSecureStore } from './index';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  preferences: Record<string, any>;
  lastSyncAt: number;
}

// Create settings store
const settingsStore = createSecureStore<AppSettings>('settings', {
  theme: 'system',
  language: 'en',
  notifications: true,
  autoSync: true,
  syncInterval: 5,
  preferences: {},
  lastSyncAt: 0,
});

/**
 * Settings management for Electron
 * Handles app configuration and user preferences
 */
export const settingsManager = {
  /**
   * Get all settings
   */
  getAll(): AppSettings {
    return settingsStore.store;
  },

  /**
   * Get specific setting
   */
  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return settingsStore.get(key);
  },

  /**
   * Set specific setting
   */
  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    settingsStore.set(key, value);
  },

  /**
   * Update multiple settings
   */
  update(settings: Partial<AppSettings>): void {
    Object.entries(settings).forEach(([key, value]) => {
      settingsStore.set(key as keyof AppSettings, value);
    });
  },

  /**
   * Reset to defaults
   */
  reset(): void {
    settingsStore.clear();
  },

  // Theme management
  theme: {
    get(): AppSettings['theme'] {
      return settingsStore.get('theme');
    },
    set(theme: AppSettings['theme']): void {
      settingsStore.set('theme', theme);
    },
  },

  // Language management
  language: {
    get(): string {
      return settingsStore.get('language');
    },
    set(language: string): void {
      settingsStore.set('language', language);
    },
  },

  // Notification settings
  notifications: {
    get(): boolean {
      return settingsStore.get('notifications');
    },
    set(enabled: boolean): void {
      settingsStore.set('notifications', enabled);
    },
  },

  // Sync settings
  sync: {
    getInterval(): number {
      return settingsStore.get('syncInterval');
    },
    setInterval(minutes: number): void {
      settingsStore.set('syncInterval', minutes);
    },
    getLastSyncAt(): number {
      return settingsStore.get('lastSyncAt');
    },
    updateLastSync(): void {
      settingsStore.set('lastSyncAt', Date.now());
    },
    isAutoSyncEnabled(): boolean {
      return settingsStore.get('autoSync');
    },
    setAutoSync(enabled: boolean): void {
      settingsStore.set('autoSync', enabled);
    },
  },

  // Custom preferences
  preferences: {
    get<T = any>(key: string): T | undefined {
      const prefs = settingsStore.get('preferences');
      return prefs[key] as T;
    },
    set(key: string, value: any): void {
      const prefs = settingsStore.get('preferences');
      settingsStore.set('preferences', { ...prefs, [key]: value });
    },
    remove(key: string): void {
      const prefs = settingsStore.get('preferences');
      delete prefs[key];
      settingsStore.set('preferences', prefs);
    },
  },
};
