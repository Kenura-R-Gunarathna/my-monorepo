import { spawn, ChildProcess } from 'child_process'
import { app } from 'electron'
import { join } from 'path'
import * as fs from 'fs/promises'
import { DoltInstaller } from './dolt-installer'

export interface DoltConfig {
  repoPath: string
  remoteName: string
  remoteUrl: string
  branch: string
}

export interface DoltQueryResult {
  rows: Record<string, unknown>[]
  rowsAffected: number
}

export interface DoltStatus {
  branch: string
  hasChanges: boolean
  isClean: boolean
  aheadBy: number
  behindBy: number
  conflicts: number
}

export class DoltManager {
  private config: DoltConfig
  private isInitialized: boolean = false
  private doltBinary: string | null = null
  private installer: DoltInstaller

  constructor(config?: Partial<DoltConfig>) {
    const userDataPath = app.getPath('userData')

    this.config = {
      repoPath: config?.repoPath || join(userDataPath, 'dolt-data'),
      remoteName: config?.remoteName || 'origin',
      remoteUrl: config?.remoteUrl || process.env.DOLT_REMOTE_URL || '',
      branch: config?.branch || 'main'
    }

    // Initialize installer
    this.installer = new DoltInstaller()
  }

  /**
   * Ensure Dolt is installed
   */
  async ensureDoltInstalled(): Promise<void> {
    // In development, try to use system Dolt first
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
      try {
        await this.spawn('dolt', ['version'])
        this.doltBinary = 'dolt'
        console.log('✅ Using system Dolt for development')
        return
      } catch {
        console.log('⚠️ System Dolt not found, will install locally')
      }
    }

    // Production or system dolt not available
    if (!this.installer.isInstalled()) {
      console.log('📦 Dolt not found, installing...')
      await this.installer.install()
    }

    this.doltBinary = this.installer.getBinaryPath()
    console.log('✅ Dolt binary located at:', this.doltBinary)
  }

  /**
   * Check if Dolt binary exists and is executable
   */
  async checkDoltInstallation(): Promise<boolean> {
    try {
      if (!this.doltBinary) {
        await this.ensureDoltInstalled()
      }
      const { stdout } = await this.spawn(this.doltBinary!, ['version'])
      console.log('✅ Dolt version:', stdout.trim())
      return true
    } catch {
      console.error('❌ Dolt not found or not executable')
      return false
    }
  }

  /**
   * Initialize Dolt repository
   */
  async init(): Promise<void> {
    try {
      // Ensure Dolt is installed first
      await this.ensureDoltInstalled()

      // Check if Dolt is available
      const hasDolt = await this.checkDoltInstallation()
      if (!hasDolt) {
        throw new Error('Dolt binary not found. Please ensure Dolt is installed.')
      }

      // Check if repo exists
      const exists = await this.repoExists()

      if (!exists) {
        console.log('📁 Creating new Dolt repository...')
        await fs.mkdir(this.config.repoPath, { recursive: true })

        if (this.config.remoteUrl) {
          // Clone from remote
          await this.clone()
        } else {
          // Initialize new repo
          await this.spawnInRepo(['init'])
          await this.spawnInRepo(['config', '--local', 'user.email', 'electron@app.local'])
          await this.spawnInRepo(['config', '--local', 'user.name', 'Electron App'])
        }
      }

      this.isInitialized = true
      console.log('✅ Dolt repository initialized at:', this.config.repoPath)
    } catch (error) {
      console.error('❌ Failed to initialize Dolt:', error)
      throw error
    }
  }

  /**
   * Clone repository from remote
   */
  private async clone(): Promise<void> {
    const parentDir = join(this.config.repoPath, '..')
    const repoName = this.config.repoPath.split(/[/\\]/).pop()!

    await this.spawn(this.doltBinary!, ['clone', this.config.remoteUrl, repoName], {
      cwd: parentDir
    })
  }

  /**
   * Check if Dolt repo exists
   */
  private async repoExists(): Promise<boolean> {
    try {
      await fs.access(join(this.config.repoPath, '.dolt'))
      return true
    } catch {
      return false
    }
  }

  /**
   * Execute a SQL query
   */
  async query(sql: string): Promise<DoltQueryResult> {
    this.ensureInitialized()

    try {
      const { stdout } = await this.spawnInRepo(['sql', '-q', sql, '-r', 'json'])

      if (!stdout.trim()) {
        return { rows: [], rowsAffected: 0 }
      }

      const result = JSON.parse(stdout)

      return {
        rows: result.rows || [],
        rowsAffected: result.rows?.length || 0
      }
    } catch (error) {
      console.error('❌ Dolt query failed:', error)
      throw new Error(
        `Dolt query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction(queries: string[]): Promise<void> {
    this.ensureInitialized()

    const sqlStatements = queries.join('; ')
    await this.spawnInRepo(['sql', '-q', sqlStatements])
  }

  /**
   * Commit changes
   */
  async commit(message: string, options?: { all?: boolean }): Promise<void> {
    this.ensureInitialized()

    try {
      // Add changes
      if (options?.all) {
        await this.spawnInRepo(['add', '.'])
      }

      // Commit
      await this.spawnInRepo(['commit', '-m', message])
      console.log('✅ Committed:', message)
    } catch (error) {
      if (error instanceof Error && error.message.includes('nothing to commit')) {
        console.log('ℹ️ Nothing to commit')
        return
      }
      throw error
    }
  }

  /**
   * Push changes to remote
   */
  async push(): Promise<void> {
    this.ensureInitialized()

    try {
      await this.spawnInRepo(['push', this.config.remoteName, this.config.branch])
      console.log('✅ Pushed to remote')
    } catch (error) {
      console.error('❌ Push failed:', error)
      throw error
    }
  }

  /**
   * Pull changes from remote
   */
  async pull(): Promise<void> {
    this.ensureInitialized()

    try {
      await this.spawnInRepo(['pull', this.config.remoteName, this.config.branch])
      console.log('✅ Pulled from remote')
    } catch (error) {
      console.error('❌ Pull failed:', error)
      throw error
    }
  }

  /**
   * Full sync: commit local changes, pull, and push
   */
  async sync(commitMessage?: string): Promise<DoltStatus> {
    this.ensureInitialized()

    try {
      // Check status before sync
      const beforeStatus = await this.getStatus()

      // Commit local changes if any
      if (beforeStatus.hasChanges) {
        await this.commit(commitMessage || `Auto-sync: ${new Date().toISOString()}`, { all: true })
      }

      // Pull remote changes
      await this.pull()

      // Check for conflicts
      const afterPull = await this.getStatus()
      if (afterPull.conflicts > 0) {
        console.warn('⚠️ Conflicts detected, attempting auto-resolution')
        await this.resolveConflicts()
      }

      // Push local changes
      await this.push()

      const finalStatus = await this.getStatus()
      console.log('✅ Sync completed successfully')

      return finalStatus
    } catch (error) {
      console.error('❌ Sync failed:', error)
      throw error
    }
  }

  /**
   * Get repository status
   */
  async getStatus(): Promise<DoltStatus> {
    this.ensureInitialized()

    try {
      const { stdout: statusOutput } = await this.spawnInRepo(['status'])
      const { stdout: branchOutput } = await this.spawnInRepo(['branch', '--show-current'])

      // Check for conflicts
      let conflicts = 0
      try {
        const conflictResult = await this.query('SELECT COUNT(*) as count FROM dolt_conflicts')
        conflicts = (conflictResult.rows[0]?.count as number) || 0
      } catch {
        // Table might not exist if no conflicts
        conflicts = 0
      }

      // Parse status
      const hasChanges = !statusOutput.includes('nothing to commit')
      const isClean = statusOutput.includes('working tree clean')

      // Check ahead/behind
      let aheadBy = 0
      let behindBy = 0
      const aheadMatch = statusOutput.match(/Your branch is ahead of '.*' by (\d+) commit/)
      const behindMatch = statusOutput.match(/Your branch is behind '.*' by (\d+) commit/)

      if (aheadMatch) aheadBy = parseInt(aheadMatch[1])
      if (behindMatch) behindBy = parseInt(behindMatch[1])

      return {
        branch: branchOutput.trim(),
        hasChanges,
        isClean,
        aheadBy,
        behindBy,
        conflicts
      }
    } catch (error) {
      console.error('❌ Failed to get status:', error)
      throw error
    }
  }

  /**
   * Get repository status (alias for getStatus)
   */
  async status(): Promise<DoltStatus> {
    return this.getStatus()
  }

  /**
   * Get list of conflicts
   */
  async getConflicts(): Promise<Record<string, unknown>[]> {
    this.ensureInitialized()

    try {
      const result = await this.query('SELECT * FROM dolt_conflicts')
      return result.rows
    } catch (error) {
      // dolt_conflicts table doesn't exist if no conflicts
      if (error instanceof Error && error.message?.includes('table not found')) {
        return []
      }
      throw error
    }
  }

  /**
   * Resolve conflicts automatically
   */
  async resolveConflicts(strategy: 'ours' | 'theirs' = 'ours'): Promise<void> {
    this.ensureInitialized()

    try {
      await this.spawnInRepo(['conflicts', 'resolve', `--${strategy}`, '.'])
      await this.commit('Auto-resolved conflicts')
      console.log('✅ Conflicts resolved')
    } catch (error) {
      console.error('❌ Failed to resolve conflicts:', error)
      throw error
    }
  }

  /**
   * Spawn command in repo directory
   */
  private async spawnInRepo(args: string[]): Promise<{ stdout: string; stderr: string }> {
    return this.spawn(this.doltBinary!, args, { cwd: this.config.repoPath })
  }

  /**
   * Spawn a child process and capture output
   * Better than exec because:
   * - No buffer size limits (can handle large results)
   * - More secure (no shell interpretation)
   * - Can stream data in real-time
   * - Cancellable via child.kill()
   */
  private async spawn(
    command: string,
    args: string[],
    options?: { cwd?: string }
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      // Spawn without shell for security
      const child: ChildProcess = spawn(command, args, {
        cwd: options?.cwd,
        shell: false, // Don't use shell - more secure
        windowsHide: true // Hide console window on Windows
      })

      let stdout = ''
      let stderr = ''

      // Collect stdout data
      child.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString()
      })

      // Collect stderr data
      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString()
      })

      // Handle spawn errors (e.g., command not found)
      child.on('error', (error: Error) => {
        reject(error)
      })

      // Handle process exit
      child.on('close', (code: number | null) => {
        if (code === 0) {
          resolve({ stdout, stderr })
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`))
        }
      })
    })
  }

  /**
   * Ensure manager is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('DoltManager not initialized. Call init() first.')
    }
  }

  /**
   * Close/cleanup
   */
  async close(): Promise<void> {
    // Nothing to cleanup for CLI-based approach
    this.isInitialized = false
  }
}
