import { app } from 'electron'
import { join } from 'path'
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  chmodSync,
  unlinkSync
} from 'fs'
import AdmZip from 'adm-zip'
import { extract } from 'tar'
import { EventEmitter } from 'events'
import * as https from 'https'
import * as http from 'http'

// Load dolt configuration
const doltConfigPath = join(__dirname, '../../dolt-config.json')
const doltConfig = JSON.parse(readFileSync(doltConfigPath, 'utf-8'))

export interface DownloadProgress {
  percent: number
  downloaded: number
  total: number
  status: string
}

export class DoltInstaller extends EventEmitter {
  private doltDir: string
  private configPath: string

  constructor() {
    super()
    this.doltDir = join(app.getPath('userData'), 'dolt')
    this.configPath = join(this.doltDir, 'install.json')
  }

  /**
   * Check if Dolt is already installed
   */
  isInstalled(): boolean {
    try {
      if (!existsSync(this.configPath)) return false

      const installed = JSON.parse(readFileSync(this.configPath, 'utf-8'))
      const binaryPath = this.getBinaryPath()

      return installed.version === doltConfig.dolt.version && existsSync(binaryPath)
    } catch {
      return false
    }
  }

  /**
   * Get installed version
   */
  getInstalledVersion(): string | null {
    try {
      if (!existsSync(this.configPath)) return null
      const installed = JSON.parse(readFileSync(this.configPath, 'utf-8'))
      return installed.version
    } catch {
      return null
    }
  }

  /**
   * Get binary path
   */
  getBinaryPath(): string {
    const platformKey = this.getPlatformKey()
    const config = doltConfig.dolt.platforms[platformKey]
    return join(this.doltDir, config.extractedFolder, 'bin', config.executable)
  }

  /**
   * Install Dolt
   */
  async install(): Promise<void> {
    if (this.isInstalled()) {
      console.log('✅ Dolt already installed')
      return
    }

    console.log('📦 Installing Dolt...')
    this.emit('status', 'Downloading Dolt...')

    try {
      // Create dolt directory
      if (!existsSync(this.doltDir)) {
        mkdirSync(this.doltDir, { recursive: true })
      }

      // Download
      const archivePath = await this.download()

      // Extract
      this.emit('status', 'Extracting Dolt...')
      await this.extract(archivePath)

      // Clean up archive
      try {
        unlinkSync(archivePath)
      } catch (error) {
        console.warn('Failed to delete archive:', error)
      }

      // Save installation info
      writeFileSync(
        this.configPath,
        JSON.stringify(
          {
            version: doltConfig.dolt.version,
            installedAt: new Date().toISOString(),
            platform: this.getPlatformKey()
          },
          null,
          2
        )
      )

      console.log('✅ Dolt installed successfully')
      this.emit('complete')
    } catch (error) {
      console.error('❌ Failed to install Dolt:', error)
      this.emit('error', error)
      throw error
    }
  }

  /**
   * Download Dolt archive
   */
  private async download(): Promise<string> {
    const platformKey = this.getPlatformKey()
    const config = doltConfig.dolt.platforms[platformKey]
    const version = doltConfig.dolt.version

    const url = `${doltConfig.dolt.baseUrl}/v${version}/${config.filename}`
    const archivePath = join(this.doltDir, config.filename)

    console.log('📥 Downloading from:', url)

    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http

      protocol
        .get(url, (response) => {
          // Handle redirects
          if (response.statusCode === 302 || response.statusCode === 301) {
            const redirectUrl = response.headers.location
            if (!redirectUrl) {
              reject(new Error('Redirect without location'))
              return
            }

            console.log('↪️ Redirecting to:', redirectUrl)

            const redirectProtocol = redirectUrl.startsWith('https') ? https : http
            redirectProtocol
              .get(redirectUrl, (redirectResponse) => {
                this.handleDownloadResponse(redirectResponse, archivePath, resolve, reject)
              })
              .on('error', reject)

            return
          }

          this.handleDownloadResponse(response, archivePath, resolve, reject)
        })
        .on('error', reject)
    })
  }

  /**
   * Handle download response
   */
  private handleDownloadResponse(
    response: http.IncomingMessage,
    archivePath: string,
    resolve: (path: string) => void,
    reject: (error: Error) => void
  ): void {
    if (response.statusCode !== 200) {
      reject(new Error(`Failed to download: ${response.statusCode}`))
      return
    }

    const totalBytes = parseInt(response.headers['content-length'] || '0', 10)
    let downloadedBytes = 0

    const fileStream = createWriteStream(archivePath)

    response.on('data', (chunk: Buffer) => {
      downloadedBytes += chunk.length
      const percent = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0

      this.emit('progress', {
        percent,
        downloaded: downloadedBytes,
        total: totalBytes,
        status: `Downloading Dolt... ${percent}%`
      })
    })

    response.pipe(fileStream)

    fileStream.on('finish', () => {
      fileStream.close()
      console.log('✅ Download complete')
      resolve(archivePath)
    })

    fileStream.on('error', (error) => {
      reject(error)
    })
  }

  /**
   * Extract archive
   */
  private async extract(archivePath: string): Promise<void> {
    const platformKey = this.getPlatformKey()
    const isWindows = platformKey.startsWith('win32')

    if (isWindows) {
      // Extract ZIP for Windows
      const zip = new AdmZip(archivePath)
      zip.extractAllTo(this.doltDir, true)
    } else {
      // Extract tar.gz for Unix
      await extract({
        file: archivePath,
        cwd: this.doltDir
      })

      // Make binary executable on Unix
      const binaryPath = this.getBinaryPath()
      chmodSync(binaryPath, '755')
    }
  }

  /**
   * Get platform key
   */
  private getPlatformKey(): string {
    const platform = process.platform
    const arch = process.arch

    if (platform === 'win32') {
      return 'win32-x64'
    } else if (platform === 'darwin') {
      return arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64'
    } else {
      return 'linux-x64'
    }
  }

  /**
   * Check for updates
   */
  async checkForUpdates(): Promise<boolean> {
    const installedVersion = this.getInstalledVersion()
    if (!installedVersion) return true

    return installedVersion !== doltConfig.dolt.version
  }

  /**
   * Update Dolt
   */
  async update(): Promise<void> {
    console.log('🔄 Updating Dolt...')
    // Remove old installation marker
    if (existsSync(this.configPath)) {
      unlinkSync(this.configPath)
    }
    await this.install()
  }
}
