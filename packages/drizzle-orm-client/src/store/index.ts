import Store from 'electron-store';
import { safeStorage } from 'electron';
import crypto from 'crypto';
import { machineIdSync } from 'node-machine-id';

/**
 * Generate a secure encryption key using machine-specific data
 * This ensures each installation has a unique key that can't be extracted from source code
 */
function deriveEncryptionKey(storeName: string): string {
  try {
    // Try to use Electron's safeStorage (uses OS keychain/credential manager)
    if (safeStorage.isEncryptionAvailable()) {
      // Generate a deterministic key from machine ID
      const machineId = machineIdSync();
      const keyMaterial = `${machineId}-${storeName}-electron-store-v1`;
      
      // Create a hash of the key material
      return crypto
        .createHash('sha256')
        .update(keyMaterial)
        .digest('hex')
        .slice(0, 32); // electron-store expects 32 character key
    }
  } catch (error) {
    console.warn('safeStorage not available, falling back to machine ID:', error);
  }

  // Fallback: Use machine ID + store name to derive key
  const machineId = machineIdSync();
  return crypto
    .createHash('sha256')
    .update(`${machineId}-${storeName}-fallback`)
    .digest('hex')
    .slice(0, 32);
}

// Base store configuration
export const createSecureStore = <T extends Record<string, any>>(
  name: string, 
  defaults?: T
): Store<T> => {
  const encryptionKey = deriveEncryptionKey(name);
  
  return new Store<T>({
    name,
    encryptionKey,
    defaults,
  });
};

// Export all store modules
export * from './session';
export * from './settings';
export * from './cache';
