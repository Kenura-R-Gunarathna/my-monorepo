# Implementation Guide for Dolt + Splash Screen

## Task 1 & 2: Dolt CLI Implementation with Bundled Binaries

### Files Created:
1. `/src/main/services/dolt-manager.ts` - Main Dolt CLI wrapper
2. `/src/main/services/settings-manager.ts` - electron-store based settings
3. `/src/main/services/connection-manager.ts` - Online/offline detection

### Required Dependencies:
```bash
cd apps/electron-desktop
pnpm add electron-store
```

### Binary Placement Structure:
```
apps/electron-desktop/
├── resources/
│   └── bin/
│       ├── dolt.exe (Windows)
│       ├── dolt (Mac)
│       └── dolt (Linux)
```

### Download Dolt Binaries:
1. **Windows**: Download from https://github.com/dolthub/dolt/releases
   - Extract `dolt.exe` to `resources/bin/dolt.exe`

2. **macOS**: Download Darwin binary
   - Extract to `resources/bin/dolt`
   - Run: `chmod +x resources/bin/dolt`

3. **Linux**: Download Linux binary
   - Extract to `resources/bin/dolt`
   - Run: `chmod +x resources/bin/dolt`

### Update electron-builder.yml:
```yaml
files:
  - from: .
    filter:
      - package.json
      - out
  - from: resources
    to: resources
    filter:
      - bin/**/*

extraResources:
  - from: resources/bin
    to: bin
    filter:
      - '**/*'

# Make binaries executable on Mac/Linux
mac:
  extraResources:
    - from: resources/bin/dolt
      to: bin/dolt
  afterPack: scripts/make-executable.js

linux:
  extraResources:
    - from: resources/bin/dolt
      to: bin/dolt
  afterPack: scripts/make-executable.js
```

### Create make-executable.js:
```javascript
// scripts/make-executable.js
const fs = require('fs')
const path = require('path')

exports.default = async function(context) {
  const platform = context.electronPlatformName
  if (platform === 'darwin' || platform === 'linux') {
    const binPath = path.join(context.appOutDir, 'bin', 'dolt')
    fs.chmodSync(binPath, '755')
    console.log('Made dolt binary executable:', binPath)
  }
}
```

## Task 3: Splash Screen Implementation

### Create Splash Screen Component

File: `src/renderer/src/components/SplashScreen.tsx`
```tsx
import { useEffect, useState } from 'react'
import './splash.css'

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initializing...')
  
  useEffect(() => {
    const steps = [
      { message: 'Loading configuration...', duration: 500 },
      { message: 'Initializing Dolt database...', duration: 1000 },
      { message: 'Checking connectivity...', duration: 800 },
      { message: 'Preparing workspace...', duration: 700 },
      { message: 'Ready!', duration: 500 }
    ]
    
    let currentStep = 0
    let currentProgress = 0
    
    const runStep = () => {
      if (currentStep >= steps.length) {
        setTimeout(onComplete, 300)
        return
      }
      
      const step = steps[currentStep]
      setStatus(step.message)
      
      const progressIncrement = 100 / steps.length
      const targetProgress = (currentStep + 1) * progressIncrement
      
      const animateProgress = () => {
        if (currentProgress < targetProgress) {
          currentProgress += 2
          setProgress(Math.min(currentProgress, targetProgress))
          requestAnimationFrame(animateProgress)
        } else {
          currentStep++
          setTimeout(runStep, step.duration)
        }
      }
      
      animateProgress()
    }
    
    runStep()
  }, [onComplete])
  
  return (
    <div className="splash-container">
      <div className="splash-content">
        <div className="splash-logo">
          <div className="logo-circle">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="currentColor"
                opacity="0.3"
              />
              <path
                d="M2 17L12 22L22 17M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="splash-title">My Electron App</h1>
        
        <div className="splash-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="splash-status">{status}</p>
        </div>
        
        <div className="splash-version">v1.0.0</div>
      </div>
    </div>
  )
}
```

### Create Splash Screen Styles

File: `src/renderer/src/components/splash.css`
```css
.splash-container {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

.splash-content {
  text-align: center;
  color: white;
  max-width: 400px;
  padding: 2rem;
}

.splash-logo {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.logo-circle {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

.logo-icon {
  width: 60px;
  height: 60px;
  color: white;
}

.splash-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 3rem;
  letter-spacing: -0.02em;
}

.splash-progress {
  margin-bottom: 2rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: width 0.3s ease-out;
}

.splash-status {
  font-size: 0.875rem;
  opacity: 0.9;
  min-height: 1.25rem;
}

.splash-version {
  font-size: 0.75rem;
  opacity: 0.6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
}
```

### Update App.tsx to use Splash Screen

File: `src/renderer/src/App.tsx`
```tsx
import { useState, useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { SplashScreen } from './components/SplashScreen'
import { router } from './router' // Your router setup

export function App() {
  const [isLoading, setIsLoading] = useState(true)
  
  const handleSplashComplete = () => {
    setIsLoading(false)
  }
  
  if (isLoading) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }
  
  return <RouterProvider router={router} />
}
```

## Blue Theme Version (as requested)

Replace the gradient in `splash.css`:
```css
.splash-container {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  /* Or use a solid blue */
  /* background: #2563eb; */
}
```

## Full Implementation Steps

### 1. Install Dependencies
```bash
cd apps/electron-desktop
pnpm add electron-store
```

### 2. Download Dolt Binaries
- Create `resources/bin/` folder
- Download appropriate binaries for each platform
- Place them in the folder

### 3. Update package.json
Add the script for making binaries executable:
```json
{
  "scripts": {
    "postinstall": "node scripts/setup-dolt.js"
  }
}
```

### 4. Create Setup Script
File: `scripts/setup-dolt.js`
```javascript
const https = require('https')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const DOLT_VERSION = 'v1.32.4' // Update to latest
const binDir = path.join(__dirname, '../resources/bin')

if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true })
}

console.log('Downloading Dolt binaries...')
console.log('Please download manually from: https://github.com/dolthub/dolt/releases')
console.log(`Place binaries in: ${binDir}`)
```

### 5. Update Main Process
Modify `src/main/index.ts` to initialize Dolt before showing window.

## Testing

1. **Development**: Ensure `dolt` is in PATH
2. **Production**: Test with packaged app to verify binary bundling

## Common Issues

### Binary Not Executable
```bash
chmod +x resources/bin/dolt
```

### Binary Not Found in Production
Check electron-builder.yml extraResources configuration

### Connection Issues
Verify Dolt remote URL in .env:
```
DOLT_REMOTE_URL=dolthub/your-username/your-repo
```

## Next Steps

1. Complete migration system (see previous response)
2. Add conflict resolution UI
3. Implement offline queue
4. Add sync status indicator

