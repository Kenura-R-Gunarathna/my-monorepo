import type { User, UserSessionData } from '@krag/zod-schema';

// Electron API interface
interface ElectronAPI {
  setUserSession: (data: UserSessionData) => Promise<void>;
  getUserSession: () => Promise<UserSessionData | null>;
  clearUserSession: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

/**
 * Electron-specific session manager
 * Handles session persistence and user data caching in Electron environment
 */
export class ElectronSessionManager {
  private static instance: ElectronSessionManager;
  private userSessionCache: Map<string, UserSessionData> = new Map();

  private constructor() {}

  static getInstance(): ElectronSessionManager {
    if (!ElectronSessionManager.instance) {
      ElectronSessionManager.instance = new ElectronSessionManager();
    }
    return ElectronSessionManager.instance;
  }

  /**
   * Store user session data with role and permissions
   */
  async storeSession(user: User, token: string, roleData?: { roleId?: number; roleName?: string; permissions?: string[] }): Promise<void> {
    const sessionData: UserSessionData = {
      token,
      user: {
        ...user,
        roleId: roleData?.roleId,
        roleName: roleData?.roleName,
        permissions: roleData?.permissions || [],
      },
      roles: roleData?.roleName ? [roleData.roleName] : [],
      permissions: roleData?.permissions || [],
      createdAt: Date.now(),
    };

    // Store in memory
    this.userSessionCache.set('current', sessionData);

    // If electron-store is available, persist to disk
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        await window.electronAPI.setUserSession(sessionData);
      } catch (error) {
        console.error('Failed to persist session to electron store:', error);
      }
    }
  }

  /**
   * Retrieve cached session data
   */
  async getSession(): Promise<UserSessionData | null> {
    // Try memory first
    const cached = this.userSessionCache.get('current');
    if (cached) {
      // Check if cache is stale (older than 5 minutes)
      const isStale = Date.now() - cached.createdAt > 5 * 60 * 1000;
      if (!isStale) {
        return cached;
      }
    }

    // Try electron store
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const stored = await window.electronAPI.getUserSession();
        if (stored) {
          this.userSessionCache.set('current', stored);
          return stored;
        }
      } catch (error) {
        console.error('Failed to retrieve session from electron store:', error);
      }
    }

    return null;
  }

  /**
   * Get user permissions
   */
  async getPermissions(): Promise<string[]> {
    const session = await this.getSession();
    return session?.permissions || [];
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    const permissions = await this.getPermissions();
    return permissions.includes(permission);
  }

  /**
   * Get user role information
   */
  async getRole(): Promise<{ id?: number; name?: string }> {
    const session = await this.getSession();
    return {
      id: session?.user?.roleId,
      name: session?.user?.roleName,
    };
  }

  /**
   * Clear session data (logout)
   */
  async clearSession(): Promise<void> {
    this.userSessionCache.clear();

    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        await window.electronAPI.clearUserSession();
      } catch (error) {
        console.error('Failed to clear session from electron store:', error);
      }
    }
  }

  /**
   * Update specific user data fields
   */
  async updateUserData(updates: Partial<User>): Promise<void> {
    const session = await this.getSession();
    if (session) {
      session.user = { ...session.user, ...updates };
      session.createdAt = Date.now();
      this.userSessionCache.set('current', session);

      if (typeof window !== 'undefined' && window.electronAPI) {
        try {
          await window.electronAPI.setUserSession(session);
        } catch (error) {
          console.error('Failed to update session in electron store:', error);
        }
      }
    }
  }
}

// Export singleton instance
export const electronSessionManager = ElectronSessionManager.getInstance();
