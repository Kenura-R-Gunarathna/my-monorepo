# Dolt Integration - Quick Reference

## Common Operations

### From Renderer (React/UI)

```typescript
// Check if Dolt is installed
const isInstalled = await window.api.dolt.checkInstalled()

// Install Dolt
const result = await window.api.dolt.install()

// Initialize database
await window.api.dolt.init()

// Execute query
const result = await window.api.dolt.query('SELECT * FROM documents')

// Commit changes
await window.api.dolt.commit('Updated documents')

// Get status
const status = await window.api.dolt.getStatus()

// Run migrations
await window.api.migrations.migrate()

// Run seeders
await window.api.seeders.seed()

// Trigger sync
await window.api.sync.syncNow()

// Check online status
const online = await window.api.connection.isOnline()
```

### Event Listeners

```typescript
// Installation progress
const unsubscribe = window.api.dolt.onInstallProgress((percent) => {
  console.log(`Installing: ${percent}%`)
})

// Installation status
window.api.dolt.onInstallStatus((status) => {
  console.log(`Status: ${status}`)
})

// Sync events
window.api.sync.onSyncStart(() => {
  console.log('Sync started')
})

window.api.sync.onSyncComplete((status) => {
  console.log('Sync complete:', status)
})

// Connection events
window.api.connection.onOnline(() => {
  console.log('Back online!')
})

window.api.connection.onOffline(() => {
  console.log('Connection lost')
})

// Clean up
unsubscribe() // Remove listener
```

## Creating Migrations

### 1. Create Migration File
Create `migrations/003_add_users.sql`:

```sql
-- up
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at DATETIME DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- down
DROP TABLE users;
```

### 2. Run Migration
```typescript
await window.api.migrations.migrate()
```

### 3. Rollback (if needed)
```typescript
await window.api.migrations.rollback()
```

## Creating Seeders

### 1. Create Seeder File
Create `seeders/002_sample_users.sql`:

```sql
INSERT INTO users (id, email, name) VALUES
  ('user-1', 'john@example.com', 'John Doe'),
  ('user-2', 'jane@example.com', 'Jane Smith');
```

### 2. Run Seeder
```typescript
await window.api.seeders.seed()
```

### 3. Force Re-run
```typescript
await window.api.seeders.seed(true)
```

## Working with Data

### Insert
```typescript
await window.api.dolt.query(`
  INSERT INTO documents (id, title, content)
  VALUES ('doc-new', 'New Document', 'Content here')
`)
```

### Update
```typescript
await window.api.dolt.query(`
  UPDATE documents
  SET title = 'Updated Title'
  WHERE id = 'doc-1'
`)
```

### Delete
```typescript
await window.api.dolt.query(`
  DELETE FROM documents
  WHERE id = 'doc-1'
`)
```

### Commit After Changes
```typescript
await window.api.dolt.commit('Added new document')
```

## Sync Workflow

### Manual Sync
```typescript
// 1. Make local changes
await window.api.dolt.query('INSERT INTO ...')

// 2. Commit
await window.api.dolt.commit('Added data')

// 3. Sync (pull + push)
await window.api.sync.syncNow()
```

### Auto-Sync
Configured in settings (runs automatically on interval):
```typescript
{
  dolt: {
    autoSync: true,
    syncInterval: 300000 // 5 minutes
  }
}
```

## Offline Operations

### Queue Operations
Operations are automatically queued when offline:

```typescript
// This will queue if offline
await window.api.dolt.query('INSERT INTO ...')
await window.api.dolt.commit('Offline commit')
```

### Process Queue When Back Online
Happens automatically, or trigger manually:

```typescript
await window.api.sync.syncNow()
```

## Conflict Resolution

### Check for Conflicts
```typescript
const status = await window.api.dolt.getStatus()
if (status.data.conflicts > 0) {
  console.log('Conflicts detected!')
}
```

### Auto-Resolve
Conflicts are auto-resolved during sync using configured strategy:
- **ours**: Keep local changes
- **theirs**: Accept remote changes
- **manual**: Requires user intervention (future)

## Development Tips

### Check Service Status
```typescript
// Migration status
const migStatus = await window.api.migrations.getStatus()
console.log('Applied migrations:', migStatus.data)

// Seeder status
const seedStatus = await window.api.seeders.getStatus()
console.log('Applied seeders:', seedStatus.data)

// Sync status
const syncStatus = await window.api.sync.getStatus()
console.log('Sync info:', syncStatus.data)

// Dolt status
const doltStatus = await window.api.dolt.getStatus()
console.log('Branch:', doltStatus.data.branch)
console.log('Has changes:', doltStatus.data.hasChanges)
console.log('Conflicts:', doltStatus.data.conflicts)
```

### Error Handling
```typescript
try {
  const result = await window.api.dolt.query('SELECT * FROM invalid_table')
  if (!result.success) {
    console.error('Query failed:', result.error)
  }
} catch (error) {
  console.error('Exception:', error)
}
```

### Testing Offline Mode
```typescript
// Simulate offline
await window.api.dolt.query('INSERT INTO documents ...')
await window.api.dolt.commit('Offline commit')

// Check queue size
const status = await window.api.sync.getStatus()
console.log('Queued operations:', status.data.queueSize)

// Process queue
await window.api.sync.syncNow()
```

## Initialization in App

```typescript
useEffect(() => {
  const init = async () => {
    // 1. Check installation
    const installed = await window.api.dolt.checkInstalled()
    
    // 2. Install if needed
    if (!installed) {
      await window.api.dolt.install()
    }
    
    // 3. Initialize
    await window.api.dolt.init()
    
    // 4. Run migrations
    await window.api.migrations.migrate()
    
    // 5. Run seeders (first time only)
    await window.api.seeders.seed()
    
    // 6. Ready!
    setReady(true)
  }
  
  init()
}, [])
```

## Debugging

### Enable Verbose Logging
Check console for:
- `✅` Success messages
- `ℹ️` Info messages
- `⚠️` Warning messages
- `❌` Error messages

### Check File Locations
```typescript
// In main process
import { app } from 'electron'

console.log('User Data:', app.getPath('userData'))
console.log('Dolt DB:', join(app.getPath('userData'), 'dolt-db'))
console.log('Dolt Binary:', join(app.getPath('userData'), 'dolt'))
```

### Inspect Database
Use Dolt CLI directly:
```bash
cd %APPDATA%/electron-desktop/dolt-db
dolt sql -q "SHOW TABLES"
dolt sql -q "SELECT * FROM _migrations"
dolt sql -q "SELECT * FROM _seeders"
dolt log
dolt status
```

## Configuration Files

### dolt-config.json
Location: `apps/electron-desktop/dolt-config.json`

Update version:
```json
{
  "version": "1.44.0"
}
```

### Settings (electron-store)
Location: `{userData}/settings.json`

```json
{
  "theme": "dark",
  "dolt": {
    "autoSync": true,
    "syncInterval": 300000,
    "remoteName": "origin",
    "remoteUrl": "https://doltremoteapi.dolthub.com/my-org/my-repo",
    "branch": "main"
  },
  "offline": {
    "enabled": true,
    "maxRetries": 3
  }
}
```

## Performance Tips

1. **Batch Operations**: Commit multiple changes together
2. **Indexes**: Add indexes for frequently queried columns
3. **Sync Interval**: Adjust based on data change frequency
4. **Queue Size**: Monitor and alert if queue grows too large
5. **Connection Polling**: Adjust interval if needed (default 10s)

## Security Considerations

1. **Remote Authentication**: Configure credentials securely
2. **Sensitive Data**: Use encryption if needed
3. **User Data Path**: Ensure proper permissions
4. **SQL Injection**: Use parameterized queries (future improvement)
5. **Settings Storage**: Consider encrypting settings with sensitive data

## Next Steps

1. Test the complete flow end-to-end
2. Configure remote repository (DoltHub or self-hosted)
3. Add error boundaries in UI
4. Add loading states for operations
5. Add user feedback for sync status
6. Implement manual conflict resolution UI
7. Add settings UI for configuration
8. Add database backup/restore
9. Add branch management UI
10. Add migration history viewer
