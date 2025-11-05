import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { getConfig } from '@krag/config/client'
import { setupTRPCHandler } from './trpc/handler'
import icon from '../../resources/icon.png?asset'

// Import services
import { DoltInstaller } from './services/dolt-installer'
import { DoltManager } from './services/dolt-manager'
import { DoltMigrations } from './services/dolt-migrations'
import { DoltSeeder } from './services/dolt-seeder'
import { ConnectionManager } from './services/connection-manager'
import { OfflineQueue } from './services/offline-queue'
import { SyncOrchestrator } from './services/sync-orchestrator'

const config = getConfig()

// Services
let doltInstaller: DoltInstaller
let doltManager: DoltManager
let migrations: DoltMigrations
let seeder: DoltSeeder
let connectionManager: ConnectionManager
let offlineQueue: OfflineQueue
let syncOrchestrator: SyncOrchestrator
let mainWindow: BrowserWindow

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: config.WINDOW_WIDTH,
    height: config.WINDOW_HEIGHT,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the renderer - use config for dev server URL
  if (config.IS_DEV && config.RENDERER_DEV_URL) {
    mainWindow.loadURL(config.RENDERER_DEV_URL)
  } else if (config.IS_DEV && process.env['ELECTRON_RENDERER_URL']) {
    // Fallback to process.env if RENDERER_DEV_URL not set in config
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Setup tRPC IPC handler
  setupTRPCHandler()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  // Initialize services
  initializeServices()

  // Setup IPC handlers
  setupIPCHandlers()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Initialize all services
function initializeServices(): void {
  const dbPath = join(app.getPath('userData'), 'dolt-db')

  // Initialize Dolt services
  doltInstaller = new DoltInstaller()
  doltManager = new DoltManager({ repoPath: dbPath })
  migrations = new DoltMigrations(doltManager)
  seeder = new DoltSeeder(doltManager)

  // Initialize connection and sync services
  connectionManager = new ConnectionManager(mainWindow)
  offlineQueue = new OfflineQueue()
  syncOrchestrator = new SyncOrchestrator(doltManager, offlineQueue, connectionManager)

  // Wire up installer events to send to renderer
  doltInstaller.on('progress', (percent: number) => {
    mainWindow.webContents.send('dolt:install:progress', percent)
  })

  doltInstaller.on('status', (status: string) => {
    mainWindow.webContents.send('dolt:install:status', status)
  })

  doltInstaller.on('complete', () => {
    mainWindow.webContents.send('dolt:install:complete')
  })

  doltInstaller.on('error', (error: Error) => {
    mainWindow.webContents.send('dolt:install:error', error.message)
  })

  // Wire up sync events
  syncOrchestrator.on('sync-start', () => {
    mainWindow.webContents.send('sync:start')
  })

  syncOrchestrator.on('sync-complete', (status: Record<string, unknown>) => {
    mainWindow.webContents.send('sync:complete', status)
  })

  syncOrchestrator.on('sync-error', (error: Error) => {
    mainWindow.webContents.send('sync:error', error)
  })

  syncOrchestrator.on('conflicts', (conflicts: Record<string, unknown>[]) => {
    mainWindow.webContents.send('sync:conflicts', conflicts)
  })

  syncOrchestrator.on('status', (status: string) => {
    mainWindow.webContents.send('sync:status', status)
  })

  // Wire up connection events
  connectionManager.on('online', () => {
    mainWindow.webContents.send('connection:online')
  })

  connectionManager.on('offline', () => {
    mainWindow.webContents.send('connection:offline')
  })
}

// Setup all IPC handlers
function setupIPCHandlers(): void {
  // Dolt installation handlers
  ipcMain.handle('dolt:checkInstalled', async () => {
    try {
      return await doltInstaller.isInstalled()
    } catch (error) {
      console.error('Error checking Dolt installation:', error)
      return false
    }
  })

  ipcMain.handle('dolt:install', async () => {
    try {
      await doltInstaller.install()
      return { success: true }
    } catch (error) {
      console.error('Error installing Dolt:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Dolt operations handlers
  ipcMain.handle('dolt:init', async () => {
    try {
      await doltManager.init()
      return { success: true }
    } catch (error) {
      console.error('Error initializing Dolt:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('dolt:query', async (_event, sql: string) => {
    try {
      const result = await doltManager.query(sql)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error executing query:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('dolt:commit', async (_event, message: string) => {
    try {
      const result = await doltManager.commit(message)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error committing:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('dolt:push', async () => {
    try {
      const result = await doltManager.push()
      return { success: true, data: result }
    } catch (error) {
      console.error('Error pushing:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('dolt:pull', async () => {
    try {
      const result = await doltManager.pull()
      return { success: true, data: result }
    } catch (error) {
      console.error('Error pulling:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('dolt:getStatus', async () => {
    try {
      const status = await doltManager.status()
      return { success: true, data: status }
    } catch (error) {
      console.error('Error getting status:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Migration handlers
  ipcMain.handle('migrations:migrate', async () => {
    try {
      const result = await migrations.migrate()
      return { success: true, data: result }
    } catch (error) {
      console.error('Error running migrations:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('migrations:rollback', async () => {
    try {
      const result = await migrations.rollback()
      return { success: true, data: result }
    } catch (error) {
      console.error('Error rolling back migration:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('migrations:getStatus', async () => {
    try {
      const status = await migrations.getStatus()
      return { success: true, data: status }
    } catch (error) {
      console.error('Error getting migration status:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Seeder handlers
  ipcMain.handle('seeders:seed', async (_event, force: boolean = false) => {
    try {
      const result = await seeder.seed(force)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error running seeders:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('seeders:getStatus', async () => {
    try {
      const status = await seeder.getStatus()
      return { success: true, data: status }
    } catch (error) {
      console.error('Error getting seeder status:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Sync handlers
  ipcMain.handle('sync:syncNow', async () => {
    try {
      const result = await syncOrchestrator.syncNow()
      return { success: true, data: result }
    } catch (error) {
      console.error('Error syncing:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('sync:getStatus', async () => {
    try {
      const status = syncOrchestrator.getStatus()
      return { success: true, data: status }
    } catch (error) {
      console.error('Error getting sync status:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Connection handler
  ipcMain.handle('connection:isOnline', async () => {
    try {
      return connectionManager.isOnline()
    } catch (error) {
      console.error('Error checking connection:', error)
      return false
    }
  })
}
