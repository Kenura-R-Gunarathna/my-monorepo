import { EventEmitter } from 'events'
import { BrowserWindow } from 'electron'
import { lookup } from 'dns'
import { promisify } from 'util'

const dnsLookup = promisify(lookup)

export class ConnectionManager extends EventEmitter {
  private _isOnline: boolean = true
  private checkInterval?: NodeJS.Timeout

  constructor(private window: BrowserWindow) {
    super()
    this.startMonitoring()
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this._isOnline
  }

  /**
   * Start monitoring connection
   */
  private startMonitoring(): void {
    // Check every 10 seconds
    this.checkInterval = setInterval(() => {
      this.checkConnection()
    }, 10000)

    // Initial check
    this.checkConnection()
  }

  /**
   * Check if online
   */
  private async checkConnection(): Promise<void> {
    const wasOnline = this._isOnline

    try {
      // Try DNS lookup for a reliable domain
      await dnsLookup('google.com')
      this._isOnline = true
    } catch {
      this._isOnline = false
    }

    // Emit events on status change
    if (wasOnline !== this._isOnline) {
      if (this._isOnline) {
        console.log('🌐 Connection restored')
        this.emit('online')
        this.window.webContents.send('connection:online')
      } else {
        console.log('📡 Connection lost')
        this.emit('offline')
        this.window.webContents.send('connection:offline')
      }
    }
  }

  /**
   * Get current status
   */
  getStatus(): boolean {
    return this.isOnline()
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
  }
}
