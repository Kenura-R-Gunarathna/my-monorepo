# React UI Component Loading Fix

## Summary
Fixed component loading issues between `packages/react-ui` and `apps/astro-web` in this monorepo setup. The main issues were improper package exports, missing entry point, and incorrect build configuration.

---

## What Was Wrong?

### 1. **Missing Package Entry Point**
**Problem:** The `react-ui` package didn't have a proper `src/index.ts` file to export its components.

**Before:** Components were scattered and there was no central entry point.

**Impact:** Astro couldn't import components using simple package imports like `import { Button } from '@krag/react-ui'`.

---

### 2. **Incorrect Package Exports Configuration**
**Problem:** The `package.json` had exports pointing to non-existent paths:
```json
{
  "exports": {
    "./components/*": "./dist/components/*.js",  // ❌ These files didn't exist
    "./lib/*": "./dist/lib/*.js"                 // ❌ These files didn't exist
  }
}
```

**Impact:** TypeScript couldn't resolve imports and module resolution failed.

---

### 3. **Improper Vite Build Configuration**
**Problem:** Vite wasn't configured for library mode, so it was building a regular app instead of a distributable package.

**Before:** CSS files were being generated as `dist/assets/react-ui.css` instead of `dist/index.css`.

**Impact:** The Astro app expected the CSS at `@krag/react-ui/styles` to resolve to `dist/index.css`.

---

### 4. **Incorrect Import Paths in Astro**
**Problem:** The Astro app was trying to import from subpaths that didn't exist:
```typescript
import { Button } from '@krag/react-ui/components/ui/button';  // ❌ Wrong
import { Card } from '@krag/react-ui/components/ui/card';      // ❌ Wrong
```

**Impact:** Build errors and module resolution failures.

---

### 5. **Package Name Mismatch**
**Problem:** The root `package.json` had incorrect package names in the build scripts:
```json
{
  "build:ui": "pnpm --filter @my-monorepo/react-ui build"  // ❌ Wrong name
}
```

**Impact:** Build commands failed because the filter couldn't find the package.

---

## What Was Fixed

### 1. **Created Proper Entry Point** (`packages/react-ui/src/index.ts`)
Created a central entry file that exports all components and utilities:
```typescript
// Import styles
import './styles/globals.css';

// Export all UI components
export { Button, buttonVariants } from './components/ui/button';
export { 
  Card, CardHeader, CardFooter, CardTitle, 
  CardAction, CardDescription, CardContent 
} from './components/ui/card';
export { Input } from './components/ui/input';

// Export utilities
export { cn } from './lib/utils';
```

**Why it works:** This creates a single point of entry that exports everything the consuming app needs.

---

### 2. **Fixed Package Exports** (`packages/react-ui/package.json`)
Simplified the exports to match the actual build output:
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./styles": "./dist/index.css"
  }
}
```

**Why it works:** Now there's only one entry point (`"."`) and a styles export that points to the actual generated CSS file.

---

### 3. **Configured Vite for Library Mode** (`packages/react-ui/vite.config.ts`)
Set up proper library build configuration:
```typescript
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ReactUI'
    },
    rollupOptions: {
      external: ['react', 'react-dom'],  // Don't bundle React
      output: [{
        format: 'es',
        entryFileNames: 'index.js',
        assetFileNames: 'index.css'  // ✅ CSS goes to dist/index.css
      }]
    },
    cssCodeSplit: false,
    cssMinify: true
  }
})
```

**Why it works:**
- `lib.entry` tells Vite this is a library, not an app
- `external` prevents React from being bundled (the consuming app provides it)
- `assetFileNames: 'index.css'` ensures CSS goes to the right location
- `cssCodeSplit: false` keeps all CSS in one file

---

### 4. **Updated Astro Imports** (`apps/astro-web/src/pages/index.astro`)
Changed to use the main package entry:
```typescript
// Before (❌)
import { Button } from '@krag/react-ui/components/ui/button';
import { Card } from '@krag/react-ui/components/ui/card';

// After (✅)
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@krag/react-ui';
import '@krag/react-ui/styles';
```

**Why it works:** Now imports come from the central entry point that exports everything.

---

### 5. **Fixed Root Package Scripts** (`package.json`)
Updated filter names to match the actual package name:
```json
{
  "build:ui": "pnpm --filter @krag/react-ui build"  // ✅ Correct
}
```

**Why it works:** The filter now matches the actual `"name"` field in the react-ui package.json.

---

## Key Takeaways

### Do's ✅
1. **Create a central `index.ts`** that imports and exports everything from your package
2. **Configure Vite properly** for library mode with correct output options
3. **Use simple imports** from the main package entry point
4. **Match package names** across your monorepo configuration
5. **Test your exports** by building the package and checking the `dist/` folder

### Don'ts ❌
1. **Don't use complex export paths** that don't exist (`./components/*`, `./lib/*`)
2. **Don't forget to external React** in library builds (prevents bundling issues)
3. **Don't mismatch package names** between root scripts and actual package.json
4. **Don't build as an app** when you need a library (use `lib` mode in Vite)

---

## How to Rebuild

After making changes to the react-ui package:

```bash
# From the root
pnpm build:ui

# Or from inside the package
cd packages/react-ui
pnpm build
```

Then restart your Astro dev server to see the changes.

---

## Monorepo Package Structure

```
packages/react-ui/
├── src/
│   ├── index.ts           # Main entry point (exports everything)
│   ├── components/ui/     # UI components
│   ├── lib/               # Utilities (cn, etc.)
│   └── styles/            # CSS files
├── dist/                  # Build output
│   ├── index.js           # Bundled JavaScript
│   ├── index.css          # Bundled CSS
│   └── index.d.ts         # TypeScript definitions
└── package.json           # Package configuration
```

**Key Point:** Everything is exported through `src/index.ts` and built into `dist/` as a library.
