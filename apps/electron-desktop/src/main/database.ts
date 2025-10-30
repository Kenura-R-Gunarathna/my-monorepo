// Example: Using database in Electron main process
import { ipcMain } from 'electron'
import { getDesktopDb, users, localCache, type DesktopDb } from '@krag/database-electron'
import { eq } from 'drizzle-orm'

// Initialize database connection
// Option 1: Use environment variable
const db: DesktopDb = getDesktopDb()

// Option 2: Pass DATABASE_URL directly (useful for dynamic DB paths)
// const DATABASE_URL = `mysql://root:@localhost:3306/electron_${app.getName()}`;
// const db = getDesktopDb(DATABASE_URL);

// IPC Handler: Get all users
ipcMain.handle('db:getUsers', async () => {
  try {
    const allUsers = await db.select().from(users)
    return { success: true, data: allUsers }
  } catch (error) {
    console.error('Failed to get users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
})

// IPC Handler: Create user
ipcMain.handle('db:createUser', async (_event, userData) => {
  try {
    const result = await db.insert(users).values(userData)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to create user:', error)
    return { success: false, error: 'Failed to create user' }
  }
})

// IPC Handler: Get cache
ipcMain.handle('db:getCache', async (_event, key: string) => {
  try {
    const cache = await db.select().from(localCache).where(eq(localCache.key, key)).limit(1)

    if (cache.length > 0 && cache[0].expiresAt && cache[0].expiresAt < new Date()) {
      // Cache expired, delete it
      await db.delete(localCache).where(eq(localCache.key, key))
      return { success: true, data: null }
    }

    return { success: true, data: cache[0] || null }
  } catch (error) {
    console.error('Failed to get cache:', error)
    return { success: false, error: 'Failed to fetch cache' }
  }
})

// IPC Handler: Set cache
ipcMain.handle('db:setCache', async (_event, key: string, value: string, expiresInDays = 7) => {
  try {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    await db
      .insert(localCache)
      .values({
        key,
        value: JSON.stringify(value),
        expiresAt
      })
      .onDuplicateKeyUpdate({
        set: {
          value: JSON.stringify(value),
          expiresAt
        }
      })

    return { success: true }
  } catch (error) {
    console.error('Failed to set cache:', error)
    return { success: false, error: 'Failed to save cache' }
  }
})

export { db }
