import type { User } from 'better-auth/types';

/**
 * Electron-specific session manager
 * Handles session persistence and user data caching in Electron environment
 */
export class ElectronSessionManager {
  private static instance: ElectronSessionManager;
  private userSessionCache: Map<string, any> = new Map();

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
  async storeSession(user: User, roleData?: { roleId?: number; roleName?: string; permissions?: string[] }): Promise<void> {
    const sessionData = {
      user: {
        ...user,
        roleId: roleData?.roleId,
        roleName: roleData?.roleName,
        permissions: roleData?.permissions || [],
      },
      lastUpdated: Date.now(),
    };

    // Store in memory
    this.userSessionCache.set('current', sessionData);

    // If electron-store is available, persist to disk
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        await (window as any).electronAPI.setUserSession(sessionData);
      } catch (error) {
        console.error('Failed to persist session to electron store:', error);
      }
    }
  }

  /**
   * Retrieve cached session data
   */
  async getSession(): Promise<any | null> {
    // Try memory first
    const cached = this.userSessionCache.get('current');
    if (cached) {
      // Check if cache is stale (older than 5 minutes)
      const isStale = Date.now() - cached.lastUpdated > 5 * 60 * 1000;
      if (!isStale) {
        return cached;
      }
    }

    // Try electron store
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        const stored = await (window as any).electronAPI.getUserSession();
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
    return session?.user?.permissions || [];
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

    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        await (window as any).electronAPI.clearUserSession();
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
      session.lastUpdated = Date.now();
      this.userSessionCache.set('current', session);

      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        try {
          await (window as any).electronAPI.setUserSession(session);
        } catch (error) {
          console.error('Failed to update session in electron store:', error);
        }
      }
    }
  }
}

// Export singleton instance
export const electronSessionManager = ElectronSessionManager.getInstance();
