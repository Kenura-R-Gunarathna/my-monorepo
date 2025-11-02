// ============================================================================
// scripts/quick-validate.js
// Fast pre-dev validation to catch obvious security violations
// ============================================================================

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const QUICK_CHECKS = [
  {
    name: 'Astro client components',
    dirs: ['apps/astro-web/src/components', 'apps/astro-web/src/pages'],
    forbiddenImports: ['@krag/config/server', '@krag/config/client'],
    allowedImports: ['@krag/config/public'],
  },
  {
    name: 'Electron renderer',
    dirs: ['apps/electron-desktop/src/renderer'],
    forbiddenImports: ['@krag/config/server', '@krag/config/client'],
    allowedImports: ['@krag/config/public'],
  },
  {
    name: 'React UI components',
    dirs: ['packages/react-ui/src/components', 'packages/react-ui/src/routes'],
    forbiddenImports: ['@krag/config/server', '@krag/config/client'],
    allowedImports: ['@krag/config/public'],
  },
]

function scanDirectory(baseDir, relativeDir, check) {
  const fullPath = join(baseDir, relativeDir)
  
  if (!existsSync(fullPath)) {
    return []
  }
  
  const violations = []
  
  try {
    const entries = readdirSync(fullPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullEntryPath = join(fullPath, entry.name)
      const relativeEntryPath = join(relativeDir, entry.name)
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        violations.push(...scanDirectory(baseDir, relativeEntryPath, check))
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        // Scan file for forbidden imports
        const content = readFileSync(fullEntryPath, 'utf-8')
        
        for (const forbidden of check.forbiddenImports) {
          // Check for imports
          const importRegex = new RegExp(`import\\s+.*?\\s+from\\s+['"\`]${forbidden.replace(/\//g, '\\/')}['"\`]`, 'g')
          const requireRegex = new RegExp(`require\\s*\\(\\s*['"\`]${forbidden.replace(/\//g, '\\/')}['"\`]\\s*\\)`, 'g')
          
          if (importRegex.test(content) || requireRegex.test(content)) {
            violations.push({ 
              file: relativeEntryPath, 
              forbidden,
              fix: check.allowedImports ? `Use ${check.allowedImports.join(' or ')} instead` : 'Move to server code'
            })
          }
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read, skip
  }
  
  return violations
}

console.log('🔍 Quick dev validation...\n')

const rootDir = join(__dirname, '..')
let hasViolations = false
let totalViolations = 0

for (const check of QUICK_CHECKS) {
  console.log(`Checking: ${check.name}`)
  let checkViolations = []
  
  for (const dir of check.dirs) {
    const violations = scanDirectory(rootDir, dir, check)
    checkViolations.push(...violations)
  }
  
  if (checkViolations.length > 0) {
    hasViolations = true
    totalViolations += checkViolations.length
    console.error(`  ❌ Found ${checkViolations.length} violation(s):`)
    
    for (const v of checkViolations.slice(0, 5)) { // Show first 5
      console.error(`     ${v.file}`)
      console.error(`     └─ imports ${v.forbidden}`)
      console.error(`        Fix: ${v.fix}\n`)
    }
    
    if (checkViolations.length > 5) {
      console.error(`     ... and ${checkViolations.length - 5} more\n`)
    }
  } else {
    console.log(`  ✅ No violations\n`)
  }
}

if (hasViolations) {
  console.error(`\n⚠️  Found ${totalViolations} security violation(s)!`)
  console.error('Dev server will start, but these imports will fail at runtime.')
  console.error('Fix them now to avoid errors during development.\n')
  
  // Don't exit - let dev server start with runtime guards
  process.exit(0)
} else {
  console.log('✅ Quick validation passed - no security violations found!\n')
  process.exit(0)
}
