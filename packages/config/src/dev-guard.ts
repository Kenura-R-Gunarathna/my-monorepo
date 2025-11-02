// ============================================================================
// packages/config/src/dev-guard.ts
// Special guards that work in HMR/dev mode
// ============================================================================

/**
 * Enhanced runtime guard that works with HMR
 * Checks on EVERY function call, not just module load
 */
export function createDevModeGuard<T>(
  allowedEnvironments: string[],
  moduleName: string
): (fn: () => T) => T {
  return (fn: () => T): T => {
    // Check environment on EVERY call (survives HMR)
    const env = detectEnvironment()
    
    if (!allowedEnvironments.includes(env)) {
      // Enhanced error for dev mode
      const error = new Error(
        `\n` +
        `🚨 DEV MODE SECURITY VIOLATION\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Module: ${moduleName}\n` +
        `Current environment: ${env}\n` +
        `Allowed environments: ${allowedEnvironments.join(', ')}\n` +
        `\n` +
        `You're in DEV MODE, so this error might be from HMR.\n` +
        `\n` +
        `QUICK FIX:\n` +
        `  1. Check your import: Are you importing ${moduleName} in client code?\n` +
        `  2. Use "@krag/config/public" instead for client components\n` +
        `  3. Restart dev server if HMR is confused\n` +
        `\n` +
        `CURRENT FILE: ${new Error().stack?.split('\n')[3]}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      )
      
      error.name = 'ConfigSecurityViolation'
      
      // In dev, also log to console with stack trace
      if (typeof console !== 'undefined') {
        console.error(error)
        console.trace('Import stack:')
      }
      
      throw error
    }
    
    return fn()
  }
}

function detectEnvironment(): string {
  // Browser environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Check if Electron renderer
    if (typeof process !== 'undefined' && (process as any).type === 'renderer') {
      return 'electron-renderer'
    }
    return 'browser'
  }
  
  // Electron main process
  if (typeof process !== 'undefined' && (process as any).type === 'browser') {
    return 'electron-main'
  }
  
  // Node.js server
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'nodejs-server'
  }
  
  return 'unknown'
}

/**
 * Module-level guard (runs once at import)
 * Use this to prevent module from loading at all in wrong environment
 */
export function guardModule(allowedEnvironments: string[], moduleName: string): void {
  const env = detectEnvironment()
  
  if (!allowedEnvironments.includes(env)) {
    throw new Error(
      `🚨 SECURITY: ${moduleName} cannot be imported in ${env} environment.\n` +
      `Allowed environments: ${allowedEnvironments.join(', ')}\n` +
      `Use: import { getPublicConfig } from "@krag/config/public"`
    )
  }
}
