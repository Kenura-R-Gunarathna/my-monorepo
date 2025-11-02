// Example: Using database in Electron main process
// import { ipcMain } from 'electron'
import { dbConn } from '@krag/drizzle-orm-client'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'

// The database connection is already initialized in the package
const db: LibSQLDatabase = dbConn

// Note: This is example code. Adjust table names and schema to match your actual schema
// Available schemas can be imported from '@krag/drizzle-orm-client'

// Example IPC handlers (commented out until you define your actual schema)

/*
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
*/

export { db }
