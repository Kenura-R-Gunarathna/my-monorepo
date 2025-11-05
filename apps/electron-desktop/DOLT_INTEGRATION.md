# Dolt Integration - Complete Implementation

## Overview
Complete Dolt database integration for the Electron desktop app with automatic installation, migrations, seeding, offline queue, and sync orchestration.

## Architecture

### Services Layer (`src/main/services/`)

1. **DoltInstaller** - Downloads and installs Dolt binaries
   - Downloads from GitHub releases (https://github.com/dolthub/dolt/releases)
   - Platform support: Windows x64, macOS Intel/ARM, Linux x64
   - Progress tracking via EventEmitter
   - Version management via `dolt-config.json`
   - Installs to: `app.getPath('userData')/dolt/`

2. **DoltManager** - CLI wrapper for Dolt operations
   - Database initialization and configuration
   - Query execution (SELECT, INSERT, UPDATE, DELETE)
   - Commit, push, pull operations
   - Status checking and conflict detection
   - Auto-installs Dolt if not found (dev mode uses system dolt)

3. **DoltMigrations** - SQL migration system
   - Reads from `migrations/*.sql` files
   - Tracks applied migrations in `_migrations` table
   - Supports `-- up` and `-- down` sections
   - Auto-commits each migration
   - Rollback support

4. **DoltSeeder** - One-time data seeding
   - Reads from `seeders/*.sql` files
   - Tracks in `_seeders` table to prevent re-running
   - Force option to re-run seeders
   - Commits seed data

5. **OfflineQueue** - Operation queue for offline mode
   - Persists to electron-store
   - Retry logic (max 3 attempts)
   - Operation types: query, commit, push
   - Processes queue when back online

6. **SyncOrchestrator** - Coordinates all sync operations
   - Auto-sync on configurable interval
   - Processes offline queue
   - Handles pull, push, conflicts
   - Conflict resolution strategies: ours, theirs, manual
   - Status tracking and event emission

7. **ConnectionManager** - Online/offline detection
   - Polls Google favicon every 10s
   - Emits online/offline events
   - Public `isOnline()` method

## Configuration

### dolt-config.json
```json
{
  "version": "1.43.14",
  "baseUrl": "https://github.com/dolthub/dolt/releases/download",
  "platforms": {
    "win32-x64": {
      "filename": "dolt-windows-amd64.zip",
      "extractedFolder": "dolt-windows-amd64"
    },
    "darwin-x64": {
      "filename": "dolt-darwin-amd64.tar.gz",
      "extractedFolder": "dolt-darwin-amd64"
    },
    "darwin-arm64": {
      "filename": "dolt-darwin-arm64.tar.gz",
      "extractedFolder": "dolt-darwin-arm64"
    },
    "linux-x64": {
      "filename": "dolt-linux-amd64.tar.gz",
      "extractedFolder": "dolt-linux-amd64"
    }
  }
}
```

## Main Process Integration (src/main/index.ts)

### Service Initialization
- All services initialized in `initializeServices()` function
- Called after `createWindow()` in `app.whenReady()`
- Event emitters wired to send IPC messages to renderer

### IPC Handlers
Complete API exposed via `ipcMain.handle()`:

#### Dolt Operations
- `dolt:checkInstalled` - Check if Dolt is installed
- `dolt:install` - Download and install Dolt
- `dolt:init` - Initialize Dolt database
- `dolt:query` - Execute SQL query
- `dolt:commit` - Commit changes
- `dolt:push` - Push to remote
- `dolt:pull` - Pull from remote
- `dolt:getStatus` - Get repository status

#### Migrations
- `migrations:migrate` - Run pending migrations
- `migrations:rollback` - Rollback last migration
- `migrations:getStatus` - Get migration status

#### Seeders
- `seeders:seed` - Run seeders
- `seeders:getStatus` - Get seeder status

#### Sync
- `sync:syncNow` - Trigger immediate sync
- `sync:getStatus` - Get sync status

#### Connection
- `connection:isOnline` - Check if online

### Event Channels
Renderer listens to these events:

#### Installer Events
- `dolt:install:progress` - Installation progress (0-100%)
- `dolt:install:status` - Status message
- `dolt:install:complete` - Installation complete
- `dolt:install:error` - Installation error

#### Sync Events
- `sync:start` - Sync started
- `sync:complete` - Sync completed with status
- `sync:error` - Sync error
- `sync:conflicts` - Conflicts detected
- `sync:status` - Status update

#### Connection Events
- `connection:online` - Came online
- `connection:offline` - Went offline

## Preload API (src/preload/index.ts)

Complete API exposed to renderer via `contextBridge`:

```typescript
window.api = {
  dolt: {
    checkInstalled: () => Promise<boolean>
    install: () => Promise<Result>
    init: () => Promise<Result>
    query: (sql: string) => Promise<Result>
    commit: (message: string) => Promise<Result>
    push: () => Promise<Result>
    pull: () => Promise<Result>
    getStatus: () => Promise<Result>
    onInstallProgress: (callback) => unsubscribe
    onInstallStatus: (callback) => unsubscribe
    onInstallComplete: (callback) => unsubscribe
    onInstallError: (callback) => unsubscribe
  },
  migrations: {
    migrate: () => Promise<Result>
    rollback: () => Promise<Result>
    getStatus: () => Promise<Result>
  },
  seeders: {
    seed: (force?: boolean) => Promise<Result>
    getStatus: () => Promise<Result>
  },
  sync: {
    syncNow: () => Promise<Result>
    getStatus: () => Promise<Result>
    onSyncStart: (callback) => unsubscribe
    onSyncComplete: (callback) => unsubscribe
    onSyncError: (callback) => unsubscribe
    onConflicts: (callback) => unsubscribe
    onStatus: (callback) => unsubscribe
  },
  connection: {
    isOnline: () => Promise<boolean>
    onOnline: (callback) => unsubscribe
    onOffline: (callback) => unsubscribe
  }
}
```

## UI Integration

### App.tsx - Initialization Flow
Complete 6-step initialization with progress tracking:

1. **Check Installation (10%)** - Check if Dolt is installed
2. **Install if Needed (50%)** - Download and install Dolt
3. **Initialize Dolt (60%)** - Initialize database
4. **Run Migrations (80%)** - Apply pending migrations
5. **Check Sync (90%)** - Verify sync status
6. **Ready (100%)** - App ready to use

Listens to installer events for real-time progress updates.

### SplashScreen Component
- Accepts external `progress` and `status` props
- Animated progress bar with shimmer effect
- Auto-completes at 100%
- Calls `onComplete` callback when done

## Migrations

### Directory Structure
```
migrations/
  001_create_documents.sql
  002_create_sync_metadata.sql
```

### Migration File Format
```sql
-- up
CREATE TABLE documents (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW()
);

CREATE INDEX idx_documents_status ON documents(status);

-- down
DROP TABLE documents;
```

## Seeders

### Directory Structure
```
seeders/
  001_sample_documents.sql
```

### Seeder File Format
```sql
INSERT INTO documents (id, title, content, status) VALUES
  ('doc-1', 'Welcome', 'Welcome content...', 'published'),
  ('doc-2', 'Getting Started', 'Guide content...', 'published'),
  ('doc-3', 'Features', 'Features overview...', 'draft');
```

## Development Workflow

### First Run
1. App launches, shows splash screen
2. Checks if Dolt installed
3. Downloads Dolt from GitHub (if needed)
4. Initializes Dolt database
5. Runs migrations
6. Runs seeders
7. Ready to use

### Development Mode
- Tries system `dolt` command first
- Falls back to installed binary if system dolt not found
- Faster startup if dolt already in PATH

### Production Mode
- Always uses installed binary
- Downloads on first run
- Cached for subsequent runs

## Testing Checklist

- [ ] Test Dolt download and installation (first run)
- [ ] Test migration system (apply/rollback)
- [ ] Test seeder system (one-time run)
- [ ] Test offline queue (disconnect, queue ops, reconnect)
- [ ] Test sync orchestrator (manual sync, auto-sync)
- [ ] Test splash screen progress (visual feedback)
- [ ] Test connection manager (online/offline detection)
- [ ] Test conflict resolution (create conflict, resolve)

## Configuration Options

### Settings (SettingsManager)
```typescript
{
  theme: 'dark' | 'light' | 'system',
  dolt: {
    autoSync: boolean,
    syncInterval: number,
    remoteName: string,
    remoteUrl: string,
    branch: string
  },
  offline: {
    enabled: boolean,
    maxRetries: number
  }
}
```

## Known Issues & Future Improvements

### Current Limitations
1. TypeScript 'any' types in some event handlers (can be improved)
2. CRLF line ending warnings (cosmetic, OS-specific)
3. Conflict resolution is basic (could add more strategies)

### Future Enhancements
1. Add UI for viewing/resolving conflicts manually
2. Add migration history UI
3. Add sync status indicator in main UI
4. Add settings UI for Dolt configuration
5. Add error retry UI for failed operations
6. Add branch management UI
7. Add backup/restore functionality

## Troubleshooting

### Dolt Installation Fails
- Check internet connection
- Check GitHub is accessible
- Check disk space
- Check write permissions to userData folder

### Migrations Fail
- Check migration SQL syntax
- Check migrations directory path
- Check Dolt is initialized
- Check _migrations table exists

### Sync Fails
- Check remote URL is configured
- Check remote is accessible
- Check authentication (if required)
- Check for conflicts

### Offline Queue Not Processing
- Check connection manager is running
- Check queue persistence (electron-store)
- Check operation format in queue

## File Locations

### User Data
- **Windows**: `%APPDATA%/electron-desktop/`
- **macOS**: `~/Library/Application Support/electron-desktop/`
- **Linux**: `~/.config/electron-desktop/`

### Dolt Binary
`{userData}/dolt/{platform}/bin/dolt[.exe]`

### Dolt Database
`{userData}/dolt-db/`

### Settings
`{userData}/settings.json` (electron-store)

### Offline Queue
`{userData}/offline-queue.json` (electron-store)

## Summary

The Dolt integration is now complete with:
✅ Automatic installation from GitHub releases
✅ Complete CLI wrapper for all Dolt operations
✅ Migration system with up/down support
✅ One-time seeding system
✅ Offline operation queue with retry logic
✅ Sync orchestration with conflict resolution
✅ Online/offline detection
✅ Complete IPC API for renderer
✅ UI integration with progress tracking
✅ Sample migrations and seeders
✅ TypeScript type definitions

The system is ready for testing and further development!
