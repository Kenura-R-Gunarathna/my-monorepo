import Store from 'electron-store'
import { EventEmitter } from 'events'

export interface QueuedOperation {
  id: string
  type: 'query' | 'commit' | 'push'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  timestamp: number
  retries: number
  lastError?: string
}

export class OfflineQueue extends EventEmitter {
  private store: Store<{ queue: QueuedOperation[] }>
  private maxRetries: number = 3
  private processing: boolean = false

  constructor() {
    super()
    this.store = new Store<{ queue: QueuedOperation[] }>({
      name: 'offline-queue',
      defaults: {
        queue: []
      }
    })
  }

  /**
   * Add operation to queue
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  add(type: QueuedOperation['type'], data: any): string {
    const operation: QueuedOperation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0
    }

    const queue = this.getQueue()
    queue.push(operation)
    this.store.set('queue', queue)

    this.emit('added', operation)
    console.log(`➕ Added to offline queue: ${type}`)

    return operation.id
  }

  /**
   * Get all queued operations
   */
  getQueue(): QueuedOperation[] {
    return this.store.get('queue', [])
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.getQueue().length
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.store.set('queue', [])
    this.emit('cleared')
  }

  /**
   * Remove operation from queue
   */
  private remove(id: string): void {
    const queue = this.getQueue()
    const filtered = queue.filter((op) => op.id !== id)
    this.store.set('queue', filtered)
  }

  /**
   * Update operation retries
   */
  private updateRetries(id: string, error: string): void {
    const queue = this.getQueue()
    const operation = queue.find((op) => op.id === id)

    if (operation) {
      operation.retries++
      operation.lastError = error

      if (operation.retries >= this.maxRetries) {
        console.error(`❌ Operation ${id} failed after ${this.maxRetries} retries`)
        this.emit('failed', operation)
        this.remove(id)
      } else {
        this.store.set('queue', queue)
      }
    }
  }

  /**
   * Process queue
   */
  async process(executor: (operation: QueuedOperation) => Promise<void>): Promise<void> {
    if (this.processing) {
      console.log('⚠️ Queue is already being processed')
      return
    }

    this.processing = true
    const queue = this.getQueue()

    if (queue.length === 0) {
      this.processing = false
      return
    }

    console.log(`📋 Processing ${queue.length} queued operation(s)...`)
    this.emit('processing-start', queue.length)

    for (const operation of queue) {
      try {
        await executor(operation)
        this.remove(operation.id)
        this.emit('processed', operation)
        console.log(`✅ Processed queued operation: ${operation.type}`)
      } catch (error) {
        console.error(`❌ Failed to process operation ${operation.id}:`, error)
        this.updateRetries(operation.id, error instanceof Error ? error.message : 'Unknown error')
      }
    }

    this.emit('processing-complete')
    this.processing = false
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.size() === 0
  }
}
