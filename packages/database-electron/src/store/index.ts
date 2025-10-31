import Store from 'electron-store';

// Base store configuration
export const createSecureStore = <T extends Record<string, any>>(name: string, defaults?: T) => {
  return new Store<T>({
    name,
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production',
    defaults,
  });
};

// Export all store modules
export * from './session';
export * from './settings';
export * from './cache';
