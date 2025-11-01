import { createSecureStore } from './index';
import type { UserSessionData } from '@krag/zod-schema';

export interface SessionStore {
  session: UserSessionData | null;
}

// Create session store with encryption
const sessionStore = createSecureStore<SessionStore>('session', {
  session: null,
});

/**
 * Session management for Electron
 * Handles user authentication state with encryption
 */
export const sessionManager = {
  /**
   * Set user session
   */
  set(data: UserSessionData): void {
    sessionStore.set('session', data);
  },

  /**
   * Get current session
   * Returns null if session is expired (5 minutes)
   */
  get(): UserSessionData | null {
    const session = sessionStore.get('session');
    
    if (!session) return null;

    // Check if session is expired
    const isExpired = Date.now() - session.createdAt > 5 * 60 * 1000;
    
    if (isExpired) {
      this.clear();
      return null;
    }

    return session;
  },

  /**
   * Update specific fields in session
   */
  update(updates: Partial<UserSessionData['user']>): void {
    const current = this.get();
    if (current) {
      this.set({
        ...current,
        user: { ...current.user, ...updates },
        createdAt: Date.now(), // Refresh timestamp
      });
    }
  },

  /**
   * Clear session (logout)
   */
  clear(): void {
    sessionStore.set('session', null);
  },

  /**
   * Get user data
   */
  getUser(): UserSessionData['user'] | null {
    const session = this.get();
    return session?.user || null;
  },

  /**
   * Get user permissions
   */
  getPermissions(): string[] {
    const session = this.get();
    return session?.permissions || [];
  },

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  },

  /**
   * Get user roles
   */
  getRoles(): string[] {
    const session = this.get();
    return session?.roles || [];
  },

  /**
   * Check if user has role
   */
  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  },
};
