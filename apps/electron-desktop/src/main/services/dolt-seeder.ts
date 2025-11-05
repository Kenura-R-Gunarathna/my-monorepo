import { DoltManager } from './dolt-manager'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { app } from 'electron'

export interface Seeder {
  name: string
  sql: string
  seededAt?: string
}

export class DoltSeeder {
  private doltManager: DoltManager
  private seedersDir: string

  constructor(doltManager: DoltManager) {
    this.doltManager = doltManager
    this.seedersDir = join(app.getAppPath(), 'seeders')
  }

  /**
   * Initialize seeders table
   */
  private async initSeedersTable(): Promise<void> {
    await this.doltManager.query(`
      CREATE TABLE IF NOT EXISTS _seeders (
        name VARCHAR(255) PRIMARY KEY,
        seeded_at DATETIME NOT NULL DEFAULT NOW()
      )
    `)
  }

  /**
   * Get seeded files
   */
  private async getSeededFiles(): Promise<string[]> {
    try {
      const result = await this.doltManager.query('SELECT name FROM _seeders')
      return result.rows.map((row) => row.name as string)
    } catch {
      return []
    }
  }

  /**
   * Load seeder files
   */
  private async loadSeeders(): Promise<Seeder[]> {
    try {
      const files = await readdir(this.seedersDir)
      const seederFiles = files.filter((f) => f.endsWith('.sql')).sort()

      const seeders: Seeder[] = []

      for (const file of seederFiles) {
        const sql = await readFile(join(this.seedersDir, file), 'utf-8')
        seeders.push({ name: file, sql })
      }

      return seeders
    } catch (error) {
      console.error('Failed to load seeders:', error)
      return []
    }
  }

  /**
   * Run seeders
   */
  async seed(force = false): Promise<{ seeded: number; total: number }> {
    await this.initSeedersTable()

    const seededFiles = force ? [] : await this.getSeededFiles()
    const allSeeders = await this.loadSeeders()
    const pendingSeeders = allSeeders.filter((s) => !seededFiles.includes(s.name))

    if (pendingSeeders.length === 0) {
      console.log('✅ No pending seeders')
      return { seeded: 0, total: allSeeders.length }
    }

    console.log(`🌱 Running ${pendingSeeders.length} seeder(s)...`)

    for (const seeder of pendingSeeders) {
      console.log(`⏳ Running seeder: ${seeder.name}`)

      try {
        // Run seeder SQL
        await this.doltManager.query(seeder.sql)

        // Record seeder
        await this.doltManager.query(`INSERT INTO _seeders (name) VALUES ('${seeder.name}')`)

        // Commit seeder
        await this.doltManager.commit(`Seeder: ${seeder.name}`)

        console.log(`✅ Seeder ${seeder.name} completed`)
      } catch (error) {
        console.error(`❌ Seeder ${seeder.name} failed:`, error)
        throw error
      }
    }

    return { seeded: pendingSeeders.length, total: allSeeders.length }
  }

  /**
   * Get seeder status
   */
  async getStatus(): Promise<{
    seeded: Seeder[]
    pending: Seeder[]
  }> {
    await this.initSeedersTable()

    const seededFiles = await this.getSeededFiles()
    const allSeeders = await this.loadSeeders()

    const seeded = allSeeders.filter((s) => seededFiles.includes(s.name))
    const pending = allSeeders.filter((s) => !seededFiles.includes(s.name))

    return { seeded, pending }
  }
}
