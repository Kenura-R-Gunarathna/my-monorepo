import Store from 'electron-store';
import type { User } from 'better-auth/types';

interface UserSessionCache {
  user: User & {
    roleId?: number;
    roleName?: string;
    permissions?: string[];
  };
  lastUpdated: number;
}

interface ElectronStoreSchema {
  userSession: UserSessionCache | null;
  theme: 'light' | 'dark' | 'system';
  lastSync: number;
}

// Create typed store with encryption
export const electronStore = new Store<ElectronStoreSchema>({
  name: 'app-data',
  encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production',
  defaults: {
    userSession: null,
    theme: 'system',
    lastSync: 0,
  },
});

// User session cache management
export const userSessionCache = {
  get(): UserSessionCache | null {
    const cached = electronStore.get('userSession');
    if (!cached) return null;

    // Check if cache is stale (older than 5 minutes)
    const isStale = Date.now() - cached.lastUpdated > 5 * 60 * 1000;
    if (isStale) {
      this.clear();
      return null;
    }

    return cached;
  },

  set(user: UserSessionCache['user']): void {
    electronStore.set('userSession', {
      user,
      lastUpdated: Date.now(),
    });
  },

  update(updates: Partial<UserSessionCache['user']>): void {
    const current = this.get();
    if (current) {
      this.set({
        ...current.user,
        ...updates,
      });
    }
  },

  clear(): void {
    electronStore.set('userSession', null);
  },

  // Get specific user data
  getUser(): (User & { roleId?: number; roleName?: string; permissions?: string[] }) | null {
    const session = this.get();
    return session?.user || null;
  },

  // Get user permissions
  getPermissions(): string[] {
    const session = this.get();
    return session?.user?.permissions || [];
  },

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const permissions = this.getPermissions();
    return permissions.includes(permission);
  },

  // Get user role
  getRole(): { id?: number; name?: string } {
    const user = this.getUser();
    return {
      id: user?.roleId,
      name: user?.roleName,
    };
  },
};

// Theme management
export const themeStore = {
  get(): 'light' | 'dark' | 'system' {
    return electronStore.get('theme');
  },

  set(theme: 'light' | 'dark' | 'system'): void {
    electronStore.set('theme', theme);
  },
};

// Last sync timestamp
export const syncStore = {
  get(): number {
    return electronStore.get('lastSync');
  },

  set(): void {
    electronStore.set('lastSync', Date.now());
  },

  clear(): void {
    electronStore.set('lastSync', 0);
  },
};

// Clear all stored data (useful for logout)
export const clearAllStores = (): void => {
  electronStore.clear();
};
