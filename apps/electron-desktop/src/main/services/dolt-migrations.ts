import { DoltManager } from './dolt-manager'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { app } from 'electron'

export interface Migration {
  id: number
  name: string
  up: string
  down: string
  appliedAt?: string
}

export class DoltMigrations {
  private doltManager: DoltManager
  private migrationsDir: string

  constructor(doltManager: DoltManager) {
    this.doltManager = doltManager
    this.migrationsDir = join(app.getAppPath(), 'migrations')
  }

  /**
   * Initialize migrations table
   */
  private async initMigrationsTable(): Promise<void> {
    await this.doltManager.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at DATETIME NOT NULL DEFAULT NOW()
      )
    `)
  }

  /**
   * Get applied migrations
   */
  private async getAppliedMigrations(): Promise<number[]> {
    try {
      const result = await this.doltManager.query('SELECT id FROM _migrations ORDER BY id')
      return result.rows.map((row) => row.id as number)
    } catch {
      return []
    }
  }

  /**
   * Parse migration file
   */
  private parseMigrationFile(content: string): { up: string; down: string } {
    const upMatch = content.match(/--\s*up\s*\n([\s\S]*?)(?=--\s*down|$)/i)
    const downMatch = content.match(/--\s*down\s*\n([\s\S]*?)$/i)

    return {
      up: upMatch ? upMatch[1].trim() : '',
      down: downMatch ? downMatch[1].trim() : ''
    }
  }

  /**
   * Load migration files
   */
  private async loadMigrations(): Promise<Migration[]> {
    try {
      const files = await readdir(this.migrationsDir)
      const migrationFiles = files.filter((f) => f.endsWith('.sql')).sort()

      const migrations: Migration[] = []

      for (const file of migrationFiles) {
        const match = file.match(/^(\d+)_(.+)\.sql$/)
        if (!match) continue

        const id = parseInt(match[1], 10)
        const name = match[2]

        const content = await readFile(join(this.migrationsDir, file), 'utf-8')
        const { up, down } = this.parseMigrationFile(content)

        migrations.push({ id, name, up, down })
      }

      return migrations
    } catch (error) {
      console.error('Failed to load migrations:', error)
      return []
    }
  }

  /**
   * Run pending migrations
   */
  async migrate(): Promise<{ applied: number; total: number }> {
    await this.initMigrationsTable()

    const appliedIds = await this.getAppliedMigrations()
    const allMigrations = await this.loadMigrations()
    const pendingMigrations = allMigrations.filter((m) => !appliedIds.includes(m.id))

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations')
      return { applied: 0, total: allMigrations.length }
    }

    console.log(`📋 Running ${pendingMigrations.length} pending migration(s)...`)

    for (const migration of pendingMigrations) {
      console.log(`⏳ Applying migration ${migration.id}: ${migration.name}`)

      try {
        // Run migration SQL
        await this.doltManager.query(migration.up)

        // Record migration
        await this.doltManager.query(
          `INSERT INTO _migrations (id, name) VALUES (${migration.id}, '${migration.name}')`
        )

        // Commit migration
        await this.doltManager.commit(`Migration: ${migration.name}`)

        console.log(`✅ Migration ${migration.id} applied successfully`)
      } catch (error) {
        console.error(`❌ Migration ${migration.id} failed:`, error)
        throw error
      }
    }

    return { applied: pendingMigrations.length, total: allMigrations.length }
  }

  /**
   * Rollback last migration
   */
  async rollback(): Promise<void> {
    const appliedIds = await this.getAppliedMigrations()
    if (appliedIds.length === 0) {
      console.log('⚠️ No migrations to rollback')
      return
    }

    const lastId = appliedIds[appliedIds.length - 1]
    const allMigrations = await this.loadMigrations()
    const migration = allMigrations.find((m) => m.id === lastId)

    if (!migration) {
      throw new Error(`Migration ${lastId} not found`)
    }

    console.log(`⏪ Rolling back migration ${migration.id}: ${migration.name}`)

    try {
      // Run down migration
      await this.doltManager.query(migration.down)

      // Remove migration record
      await this.doltManager.query(`DELETE FROM _migrations WHERE id = ${migration.id}`)

      // Commit rollback
      await this.doltManager.commit(`Rollback migration: ${migration.name}`)

      console.log(`✅ Migration ${migration.id} rolled back successfully`)
    } catch (error) {
      console.error(`❌ Rollback failed:`, error)
      throw error
    }
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    applied: Migration[]
    pending: Migration[]
  }> {
    await this.initMigrationsTable()

    const appliedIds = await this.getAppliedMigrations()
    const allMigrations = await this.loadMigrations()

    const applied = allMigrations.filter((m) => appliedIds.includes(m.id))
    const pending = allMigrations.filter((m) => !appliedIds.includes(m.id))

    return { applied, pending }
  }
}
