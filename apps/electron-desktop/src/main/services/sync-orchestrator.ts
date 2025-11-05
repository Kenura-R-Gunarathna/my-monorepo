import { EventEmitter } from 'events'
import { DoltManager } from './dolt-manager'
import { OfflineQueue, QueuedOperation } from './offline-queue'
import { ConnectionManager } from './connection-manager'
import { settingsManager } from './settings-manager'

export class SyncOrchestrator extends EventEmitter {
  private doltManager: DoltManager
  private offlineQueue: OfflineQueue
  private connectionManager: ConnectionManager
  private syncInterval: NodeJS.Timeout | null = null
  private isSyncing: boolean = false

  constructor(
    doltManager: DoltManager,
    offlineQueue: OfflineQueue,
    connectionManager: ConnectionManager
  ) {
    super()
    this.doltManager = doltManager
    this.offlineQueue = offlineQueue
    this.connectionManager = connectionManager

    // Listen for connection changes
    this.connectionManager.on('online', () => this.handleOnline())
    this.connectionManager.on('offline', () => this.handleOffline())

    // Start auto-sync if enabled
    this.startAutoSync()
  }

  /**
   * Handle coming online
   */
  private async handleOnline(): Promise<void> {
    console.log('🌐 Connection restored, processing offline queue...')
    this.emit('status', 'Processing offline queue...')

    try {
      // Process offline queue first
      await this.processOfflineQueue()

      // Then sync with remote
      await this.sync()
    } catch (error) {
      console.error('Failed to process online restoration:', error)
      this.emit('error', error)
    }
  }

  /**
   * Handle going offline
   */
  private handleOffline(): void {
    console.log('📴 Connection lost, entering offline mode')
    this.emit('status', 'Offline mode')
  }

  /**
   * Process offline queue
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.isEmpty()) {
      return
    }

    await this.offlineQueue.process(async (operation: QueuedOperation) => {
      switch (operation.type) {
        case 'query':
          await this.doltManager.query(operation.data.sql)
          break

        case 'commit':
          await this.doltManager.commit(operation.data.message)
          break

        case 'push':
          await this.doltManager.push()
          break

        default:
          console.warn('Unknown operation type:', operation.type)
      }
    })
  }

  /**
   * Start auto-sync
   */
  private startAutoSync(): void {
    const settings = settingsManager.getAll()

    if (!settings.autoSync) {
      console.log('⚠️ Auto-sync is disabled')
      return
    }

    const intervalMs = settings.syncInterval * 60 * 1000 // Convert minutes to milliseconds

    this.syncInterval = setInterval(() => {
      if (this.connectionManager.isOnline()) {
        this.sync().catch((error) => {
          console.error('Auto-sync failed:', error)
          this.emit('error', error)
        })
      }
    }, intervalMs)

    console.log(`✅ Auto-sync started (interval: ${settings.syncInterval} minutes)`)
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log('⏹️ Auto-sync stopped')
    }
  }

  /**
   * Manual sync
   */
  async sync(): Promise<void> {
    if (this.isSyncing) {
      console.log('⚠️ Sync already in progress')
      return
    }

    if (!this.connectionManager.isOnline()) {
      console.log('📴 Cannot sync: offline')
      this.emit('error', new Error('Cannot sync while offline'))
      return
    }

    this.isSyncing = true
    this.emit('sync-start')

    try {
      console.log('🔄 Starting sync...')

      // 1. Process offline queue first
      this.emit('status', 'Processing offline changes...')
      await this.processOfflineQueue()

      // 2. Get current status
      const status = await this.doltManager.getStatus()

      // 3. Pull latest changes
      if (status.behindBy > 0) {
        this.emit('status', 'Pulling changes...')
        await this.doltManager.pull()
      }

      // 4. Push local changes
      if (status.aheadBy > 0 || status.hasChanges) {
        this.emit('status', 'Pushing changes...')

        // Commit any uncommitted changes
        if (status.hasChanges) {
          await this.doltManager.commit('Auto-sync: local changes')
        }

        await this.doltManager.push()
      }

      // 5. Handle conflicts if any
      if (status.conflicts > 0) {
        this.emit('status', 'Resolving conflicts...')
        await this.handleConflicts()
      }

      // 6. Update last sync time
      settingsManager.set('lastSyncAt', Date.now())

      console.log('✅ Sync completed successfully')
      this.emit('sync-complete', {
        pulledChanges: status.behindBy,
        pushedChanges: status.aheadBy,
        conflicts: status.conflicts
      })
    } catch (error) {
      console.error('❌ Sync failed:', error)
      this.emit('sync-error', error)
      throw error
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Handle conflicts based on resolution strategy
   */
  private async handleConflicts(): Promise<void> {
    const settings = settingsManager.getAll()
    const strategy = settings.dolt.conflictResolution

    switch (strategy) {
      case 'ours':
        await this.doltManager.resolveConflicts('ours')
        break

      case 'theirs':
        await this.doltManager.resolveConflicts('theirs')
        break

      case 'manual': {
        // Get conflicts and emit event for UI to handle
        const conflicts = await this.doltManager.getConflicts()
        this.emit('conflicts', conflicts)
        break
      }

      default:
        console.warn('Unknown conflict resolution strategy:', strategy)
    }
  }

  /**
   * Get sync status
   */
  async getStatus(): Promise<{
    isOnline: boolean
    isSyncing: boolean
    queueSize: number
    lastSyncAt: number
  }> {
    return {
      isOnline: this.connectionManager.isOnline(),
      isSyncing: this.isSyncing,
      queueSize: this.offlineQueue.size(),
      lastSyncAt: settingsManager.get('lastSyncAt')
    }
  }

  /**
   * Force sync now
   */
  async syncNow(): Promise<void> {
    return this.sync()
  }
}
