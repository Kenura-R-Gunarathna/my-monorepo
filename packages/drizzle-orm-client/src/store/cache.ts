import { createSecureStore } from './index';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number | null;
}

interface CacheStore {
  entries: Record<string, CacheEntry>;
  metadata: {
    totalSize: number;
    lastCleanup: number;
  };
}

// Create cache store
const cacheStore = createSecureStore<CacheStore>('cache', {
  entries: {},
  metadata: {
    totalSize: 0,
    lastCleanup: Date.now(),
  },
});

/**
 * Cache management for Electron
 * Handles offline data caching with TTL support
 */
export const cacheManager = {
  /**
   * Set cache entry with optional TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (null = no expiry)
   */
  set<T = any>(key: string, data: T, ttl: number | null = null): void {
    const entries = cacheStore.get('entries');
    const expiresAt = ttl ? Date.now() + ttl : null;

    entries[key] = {
      data,
      timestamp: Date.now(),
      expiresAt,
    };

    cacheStore.set('entries', entries);
    this.updateMetadata();
  },

  /**
   * Get cache entry
   * Returns null if expired or not found
   */
  get<T = any>(key: string): T | null {
    const entries = cacheStore.get('entries');
    const entry = entries[key];

    if (!entry) return null;

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  },

  /**
   * Check if cache entry exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  },

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    const entries = cacheStore.get('entries');
    delete entries[key];
    cacheStore.set('entries', entries);
    this.updateMetadata();
  },

  /**
   * Clear all cache entries
   */
  clear(): void {
    cacheStore.set('entries', {});
    this.updateMetadata();
  },

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const entries = cacheStore.get('entries');
    const now = Date.now();

    Object.keys(entries).forEach(key => {
      const entry = entries[key];
      if (entry.expiresAt && now > entry.expiresAt) {
        delete entries[key];
      }
    });

    cacheStore.set('entries', entries);
    this.updateMetadata();
  },

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    expiredEntries: number;
    totalSize: number;
    lastCleanup: number;
  } {
    const entries = cacheStore.get('entries');
    const metadata = cacheStore.get('metadata');
    const now = Date.now();

    const expiredEntries = Object.values(entries).filter(
      entry => entry.expiresAt && now > entry.expiresAt
    ).length;

    return {
      totalEntries: Object.keys(entries).length,
      expiredEntries,
      totalSize: metadata.totalSize,
      lastCleanup: metadata.lastCleanup,
    };
  },

  /**
   * Update cache metadata
   * @internal
   */
  updateMetadata(): void {
    const entries = cacheStore.get('entries');
    const totalSize = Object.keys(entries).length;

    cacheStore.set('metadata', {
      totalSize,
      lastCleanup: Date.now(),
    });
  },

  /**
   * Get all cache keys
   */
  keys(): string[] {
    const entries = cacheStore.get('entries');
    return Object.keys(entries);
  },

  /**
   * Set multiple cache entries
   */
  setMany(items: Record<string, any>, ttl: number | null = null): void {
    Object.entries(items).forEach(([key, data]) => {
      this.set(key, data, ttl);
    });
  },

  /**
   * Get multiple cache entries
   */
  getMany<T = any>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });
    return result;
  },

  /**
   * Cache with fallback function
   * If cache miss, calls fn and caches result
   */
  async getOrSet<T = any>(
    key: string,
    fn: () => Promise<T> | T,
    ttl: number | null = null
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const data = await fn();
    this.set(key, data, ttl);
    return data;
  },
};

// Auto cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cacheManager.clearExpired();
  }, 5 * 60 * 1000);
}
