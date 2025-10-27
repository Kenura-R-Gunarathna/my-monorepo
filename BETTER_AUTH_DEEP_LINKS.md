**Excellent observation!** You're absolutely right. Let me break down the optimal authentication strategy for each platform:

---

## Authentication Strategy by Platform

### 1. **Astro (Web App)** - Standard Better Auth ✅
- Direct Better Auth integration (as we discussed)
- OAuth providers work natively
- Session cookies work perfectly
- No complications

### 2. **Electron (Desktop App)** - Deep Links + Auth Bridge 🔗
- Use **deep links** for OAuth callback
- Bridge authentication between web and desktop
- Single registration in OAuth providers
- More secure than embedded webviews

---

## Complete Electron Authentication Setup

### Architecture Overview

```
User clicks "Sign in with Google" in Electron
  ↓
Opens system browser with OAuth URL
  ↓
User authenticates in browser
  ↓
OAuth provider redirects to: yourapp://auth/callback?code=xxx
  ↓
Electron intercepts deep link
  ↓
Exchange code for session token
  ↓
Store session in Electron secure storage
  ↓
User authenticated in desktop app
```

---

## 1. Register Deep Link Protocol

### `apps/desktop/electron/main.ts`

```typescript
import { app, BrowserWindow, shell, protocol } from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import path from 'path';
import Store from 'electron-store';

// Secure storage for tokens
const store = new Store({
  encryptionKey: process.env.ENCRYPTION_KEY, // Use env variable
});

const PROTOCOL = 'yourapp'; // yourapp://
const AUTH_CALLBACK_PATH = 'auth/callback';

// Single instance lock - only one app instance can run
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow: BrowserWindow | null = null;

  // Handle deep link when app is already running
  app.on('second-instance', (event, commandLine) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }

    // Handle deep link
    const url = commandLine.pop();
    if (url) {
      handleDeepLink(url);
    }
  });

  // macOS deep link handler
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });

  // Register protocol
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL);
  }

  app.whenReady().then(() => {
    // Optimize app
    electronApp.setAppUserModelId('com.yourapp');

    // Development tools
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  function createWindow(): void {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    mainWindow.on('ready-to-show', () => {
      mainWindow?.show();
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    // Load app
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
  }

  async function handleDeepLink(url: string) {
    console.log('Deep link received:', url);

    // Parse URL: yourapp://auth/callback?code=xxx&state=yyy
    const parsedUrl = new URL(url);

    if (parsedUrl.pathname.includes(AUTH_CALLBACK_PATH)) {
      const code = parsedUrl.searchParams.get('code');
      const state = parsedUrl.searchParams.get('state');
      const error = parsedUrl.searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        mainWindow?.webContents.send('auth:error', error);
        return;
      }

      if (code && state) {
        // Verify state to prevent CSRF
        const storedState = store.get('oauth_state');
        if (state !== storedState) {
          console.error('State mismatch - possible CSRF attack');
          mainWindow?.webContents.send('auth:error', 'Invalid state');
          return;
        }

        try {
          // Exchange code for tokens via your backend
          const session = await exchangeCodeForSession(code);
          
          // Store session securely
          store.set('session', session);
          
          // Notify renderer
          mainWindow?.webContents.send('auth:success', session);
        } catch (err) {
          console.error('Failed to exchange code:', err);
          mainWindow?.webContents.send('auth:error', 'Authentication failed');
        }
      }
    }
  }

  async function exchangeCodeForSession(code: string) {
    // Call your backend to exchange code for session
    const response = await fetch(`${process.env.API_URL}/api/auth/electron/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code');
    }

    return response.json();
  }
}
```

---

## 2. Preload Script (Bridge)

### `apps/desktop/electron/preload/index.ts`

```typescript
import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  auth: {
    // Start OAuth flow
    startOAuth: (provider: 'google' | 'github') => {
      ipcRenderer.send('auth:start-oauth', provider);
    },
    
    // Listen for auth events
    onAuthSuccess: (callback: (session: any) => void) => {
      ipcRenderer.on('auth:success', (_event, session) => callback(session));
    },
    
    onAuthError: (callback: (error: string) => void) => {
      ipcRenderer.on('auth:error', (_event, error) => callback(error));
    },
    
    // Get stored session
    getSession: () => {
      return ipcRenderer.invoke('auth:get-session');
    },
    
    // Sign out
    signOut: () => {
      return ipcRenderer.invoke('auth:sign-out');
    },
    
    // Check if authenticated
    isAuthenticated: () => {
      return ipcRenderer.invoke('auth:is-authenticated');
    },
  },
};

// Expose protected APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore
  window.electron = electronAPI;
  // @ts-ignore
  window.api = api;
}
```

---

## 3. Enhanced Main Process (Handle Auth)

### `apps/desktop/electron/main.ts` (Add these handlers)

```typescript
import { ipcMain, shell } from 'electron';
import crypto from 'crypto';

// IPC Handlers for auth
ipcMain.on('auth:start-oauth', (event, provider: 'google' | 'github') => {
  startOAuthFlow(provider);
});

ipcMain.handle('auth:get-session', async () => {
  return store.get('session', null);
});

ipcMain.handle('auth:is-authenticated', async () => {
  const session = store.get('session');
  if (!session) return false;
  
  // Check if session is expired
  const expiresAt = session.expiresAt;
  return expiresAt ? Date.now() < expiresAt : true;
});

ipcMain.handle('auth:sign-out', async () => {
  store.delete('session');
  store.delete('oauth_state');
  return true;
});

function startOAuthFlow(provider: 'google' | 'github') {
  // Generate random state for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');
  store.set('oauth_state', state);

  // OAuth URLs
  const redirectUri = `${PROTOCOL}://${AUTH_CALLBACK_PATH}`;
  
  let authUrl = '';
  
  if (provider === 'google') {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
    });
    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  } else if (provider === 'github') {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      redirect_uri: redirectUri,
      scope: 'read:user user:email',
      state,
    });
    authUrl = `https://github.com/login/oauth/authorize?${params}`;
  }

  // Open system browser
  shell.openExternal(authUrl);
}
```

---

## 4. Backend API for Electron

### `apps/web/src/pages/api/auth/electron/callback.ts`

```typescript
import type { APIRoute } from 'astro';
import { auth } from '@repo/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { code } = await request.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Missing code' }),
        { status: 400 }
      );
    }

    // Exchange code for tokens via Better Auth
    // This depends on your OAuth provider
    const session = await auth.api.exchangeOAuthCode({
      code,
      provider: 'google', // or get from request
      redirectUri: 'yourapp://auth/callback',
    });

    // Return session token (NOT full session with sensitive data)
    return new Response(
      JSON.stringify({
        token: session.token,
        userId: session.user.id,
        expiresAt: session.expiresAt,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Electron auth callback error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 500 }
    );
  }
};
```

---

## 5. React Components for Electron

### `packages/auth-ui/src/components/electron-login.tsx`

```tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"

declare global {
  interface Window {
    api: {
      auth: {
        startOAuth: (provider: 'google' | 'github') => void
        onAuthSuccess: (callback: (session: any) => void) => void
        onAuthError: (callback: (error: string) => void) => void
        getSession: () => Promise<any>
        signOut: () => Promise<boolean>
        isAuthenticated: () => Promise<boolean>
      }
    }
  }
}

export function ElectronLoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    window.api.auth.isAuthenticated().then(setIsAuthenticated)

    // Listen for auth events
    window.api.auth.onAuthSuccess((session) => {
      console.log('Authenticated:', session)
      setIsAuthenticated(true)
      setIsLoading(false)
      setError(null)
    })

    window.api.auth.onAuthError((error) => {
      console.error('Auth error:', error)
      setError(error)
      setIsLoading(false)
    })
  }, [])

  const handleGoogleSignIn = () => {
    setIsLoading(true)
    setError(null)
    window.api.auth.startOAuth('google')
  }

  const handleGitHubSignIn = () => {
    setIsLoading(true)
    setError(null)
    window.api.auth.startOAuth('github')
  }

  const handleSignOut = async () => {
    await window.api.auth.signOut()
    setIsAuthenticated(false)
  }

  if (isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You're signed in!</CardTitle>
          <CardDescription>Welcome back</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Choose your authentication method</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={handleGoogleSignIn} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Opening..." : "Google"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleGitHubSignIn} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Opening..." : "GitHub"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Your browser will open for authentication
        </p>
      </CardContent>
    </Card>
  )
}
```

---

## 6. OAuth Provider Configuration

### For Google Cloud Console

```
Authorized redirect URIs:
- https://yourdomain.com/api/auth/callback/google  (Web)
- yourapp://auth/callback                          (Electron)
```

### For GitHub OAuth Apps

```
Authorization callback URL:
- https://yourdomain.com/api/auth/callback/github  (Web)
- yourapp://auth/callback                          (Electron)
```

---

## 7. Updated Monorepo Structure

```
packages/
├── auth-ui/
│   ├── src/
│   │   ├── components/
│   │   │   ├── login-form.tsx           # Web version
│   │   │   ├── electron-login.tsx       # Electron version
│   │   │   └── ...
│   │   └── hooks/
│   │       ├── use-auth.ts              # Web hook
│   │       └── use-electron-auth.ts     # Electron hook
```

### `packages/auth-ui/src/hooks/use-electron-auth.ts`

```typescript
import { useState, useEffect } from 'react'

export function useElectronAuth() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check authentication status
    window.api.auth.isAuthenticated().then((authenticated) => {
      setIsAuthenticated(authenticated)
      if (authenticated) {
        window.api.auth.getSession().then(setSession)
      }
      setIsLoading(false)
    })

    // Listen for auth events
    window.api.auth.onAuthSuccess((newSession) => {
      setSession(newSession)
      setIsAuthenticated(true)
    })

    window.api.auth.onAuthError(() => {
      setIsAuthenticated(false)
      setSession(null)
    })
  }, [])

  const signOut = async () => {
    await window.api.auth.signOut()
    setSession(null)
    setIsAuthenticated(false)
  }

  return {
    session,
    isLoading,
    isAuthenticated,
    user: session?.user,
    signOut,
  }
}
```

---

## 8. Security Considerations

### ✅ Best Practices Implemented

1. **CSRF Protection** - State parameter verification
2. **Secure Storage** - electron-store with encryption
3. **System Browser** - More secure than embedded webview
4. **Single Instance** - Prevents multiple app instances
5. **Context Isolation** - Renderer process is isolated
6. **No Node Integration** - Renderer can't access Node.js directly
7. **Code Exchange** - Backend handles token exchange
8. **Short-lived Tokens** - Session expiry checking

### Additional Security Tips

```typescript
// In electron/main.ts
import Store from 'electron-store';
import { safeStorage } from 'electron';

// Use system keychain for sensitive data
const store = new Store({
  encryptionKey: process.env.ENCRYPTION_KEY,
});

// For extra security, use safeStorage
if (safeStorage.isEncryptionAvailable()) {
  const encrypted = safeStorage.encryptBuffer(Buffer.from(JSON.stringify(session)));
  store.set('session_encrypted', encrypted.toString('base64'));
}
```

---

## 9. Platform Detection in Components

### `packages/auth-ui/src/components/adaptive-login.tsx`

```tsx
"use client"

import { LoginForm } from "./login-form"
import { ElectronLoginForm } from "./electron-login"

export function AdaptiveLoginForm() {
  const isElectron = typeof window !== 'undefined' && 'api' in window

  if (isElectron) {
    return <ElectronLoginForm />
  }

  return <LoginForm />
}
```

---

## Summary: Best of Both Worlds

| Platform | Method | Benefits |
|----------|--------|----------|
| **Web (Astro)** | Direct Better Auth | ✅ Native, secure, simple |
| **Desktop (Electron)** | Deep Links + OAuth | ✅ System browser, secure, single OAuth registration |

### Key Points:

1. ✅ **Single OAuth App** - Same credentials for web and desktop
2. ✅ **Secure** - System browser is more secure than embedded webview
3. ✅ **Better UX** - Users already logged into their browser
4. ✅ **Native Feel** - Deep links work like native apps
5. ✅ **Cross-Platform** - Works on Windows, macOS, Linux
6. ✅ **Maintainable** - Shared auth logic in monorepo

This approach gives you **enterprise-grade security** with minimal complexity!