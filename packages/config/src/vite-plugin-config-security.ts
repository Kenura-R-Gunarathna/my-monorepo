// ============================================================================
// packages/config/src/vite-plugin-config-security.ts
// Vite plugin to catch wrong imports during development
// ============================================================================

export interface ConfigSecurityOptions {
  /** Server-only modules that should never be in client code */
  serverModules: string[]
  /** Patterns matching client code files */
  clientPatterns: RegExp[]
  /** Enable detailed logging */
  verbose?: boolean
}

export function configSecurityPlugin(options: ConfigSecurityOptions): any {
  const { serverModules, clientPatterns, verbose = false } = options
  
  let violationsFound = 0
  
  return {
    name: 'config-security',
    enforce: 'pre',
    
    buildStart() {
      violationsFound = 0
      if (verbose) {
        console.log('🔍 Config security plugin active')
      }
    },
    
    // Check imports during dev and build
    transform(code: string, id: string) {
      // Skip node_modules
      if (id.includes('node_modules')) return null
      
      // Check if this is client code
      const isClientCode = clientPatterns.some(pattern => pattern.test(id))
      
      if (!isClientCode) {
        if (verbose) {
          console.log(`✓ Server file (allowed): ${id}`)
        }
        return null
      }
      
      // Check for forbidden imports in client code
      const violations: Array<{ module: string; line: number }> = []
      
      // Simple regex-based detection (fast, good enough for dev)
      const lines = code.split('\n')
      lines.forEach((line: string, index: number) => {
        // Match: import ... from 'module' or import ... from "module"
        const importMatch = line.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/)
        if (importMatch) {
          const importSource = importMatch[1]
          
          if (serverModules.some(mod => importSource.includes(mod))) {
            violations.push({
              module: importSource,
              line: index + 1,
            })
          }
        }
        
        // Also check require()
        const requireMatch = line.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/)
        if (requireMatch) {
          const importSource = requireMatch[1]
          
          if (serverModules.some(mod => importSource.includes(mod))) {
            violations.push({
              module: importSource,
              line: index + 1,
            })
          }
        }
      })
      
      if (violations.length > 0) {
        violationsFound += violations.length
        
        const error = new Error(
          `\n🚨 DEV MODE SECURITY VIOLATION\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `File: ${id}\n` +
          `\n` +
          violations.map(v => 
            `  Line ${v.line}: import from "${v.module}"\n` +
            `  ❌ This is a SERVER-ONLY module\n`
          ).join('\n') +
          `\n` +
          `FIX:\n` +
          `  • Use "@krag/config/public" for client-side code\n` +
          `  • Or move this code to a server-only file (api/, server/, etc.)\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        )
        
        this.error(error)
      }
      
      return null
    },
    
    buildEnd() {
      if (violationsFound > 0) {
        console.error(`\n❌ Found ${violationsFound} security violation(s)\n`)
      } else {
        console.log('✅ Config security check passed')
      }
    },
  }
}
