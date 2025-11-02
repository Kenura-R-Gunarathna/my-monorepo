// ============================================================================
// packages/config/src/security.ts
// Security utilities for filtering and protecting config
// ============================================================================

/**
 * Security boundaries define what config keys are safe for each environment
 */
export const SECURITY_BOUNDARIES = {
  server: {
    // Public config - safe for client/browser
    public: [
      'BASE_URL',
      'API_ENDPOINT',
      'ENABLE_ANALYTICS',
      'APP_VERSION',
      'NODE_ENV',
      'IS_DEV',
      'LOG_LEVEL',
    ] as const,
    
    // Private config - server-only (never expose to client)
    private: [
      'DATABASE_URL',
      'SESSION_SECRET',
      'RESEND_API_KEY',
      'STRIPE_SECRET_KEY',
      'GITHUB_CLIENT_SECRET',
      'GOOGLE_CLIENT_SECRET',
      'BETTER_AUTH_URL',
      'DB_ENCRYPTION_KEY',
      'LICENSE_KEY',
    ] as const,
  },
  
  client: {
    // Public config - safe for client/renderer
    public: [
      'API_URL',
      'WINDOW_WIDTH',
      'WINDOW_HEIGHT',
      'ENABLE_DEV_TOOLS',
      'NODE_ENV',
      'IS_DEV',
      'LOG_LEVEL',
    ] as const,
    
    // Private config - server/process only
    private: [
      'DB_FILE_NAME',
      'DB_ENCRYPTION_KEY',
      'AUTO_UPDATE_URL',
      'AUTO_UPDATE_ENABLED',
      'LICENSE_KEY',
      'ENABLE_CONTEXT_ISOLATION',
      'ENABLE_NODE_INTEGRATION',
      'ENABLE_CAMERA',
      'ENABLE_MICROPHONE',
    ] as const,
  },
} as const

/**
 * Filter config object to only include public keys
 */
export function filterPublicConfig<T extends Record<string, any>>(
  config: T,
  publicKeys: readonly string[]
): Partial<T> {
  const filtered: Partial<T> = {}
  
  for (const key of publicKeys) {
    if (key in config) {
      filtered[key as keyof T] = config[key as keyof T]
    }
  }
  
  return filtered
}

/**
 * Redact private values for logging
 */
export function redactSecrets<T extends Record<string, any>>(
  config: T,
  privateKeys: readonly string[]
): Record<string, any> {
  const redacted: Record<string, any> = { ...config }
  
  for (const key of privateKeys) {
    if (key in redacted && redacted[key]) {
      // Show hint for debugging without exposing private data
      redacted[key] = '***REDACTED***'
    }
  }
  
  return redacted
}

/**
 * Validate that client code isn't accessing server-only config
 */
export function assertPublicAccess(
  requestedKeys: string[],
  publicKeys: readonly string[],
  moduleName: string
): void {
  const forbidden = requestedKeys.filter(key => !publicKeys.includes(key))
  
  if (forbidden.length > 0) {
    throw new Error(
      `🚨 SECURITY: Attempted to access private config from client.\n` +
      `Module: ${moduleName}\n` +
      `Forbidden keys: ${forbidden.join(', ')}\n` +
      `\n` +
      `Use getPublicConfig() instead of getPrivateConfig() in client code.`
    )
  }
}
