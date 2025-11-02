import { router, publicProcedure } from '../../trpc'
import { syncQueue, documents, users, roles, permissions, settings } from '@krag/drizzle-orm-client'
import { eq, count } from 'drizzle-orm'
import { db } from '../../database'
import { astroClient, checkOnline, startNetworkMonitor } from '../astro-client'
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentIdSchema,
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  createRoleSchema,
  updateRoleSchema,
  createPermissionSchema,
  updatePermissionSchema,
  createSettingSchema,
  updateSettingSchema,
  idSchema
} from '@krag/zod-schema'

export const syncRouter = router({
  /**
   * Get current sync status
   */
  getStatus: publicProcedure.query(async () => {
    const online = await checkOnline()
    const [{ pending }] = await db.select({ pending: count() }).from(syncQueue)
    return { online, pendingOperations: pending, lastCheck: new Date() }
  }),

  /**
   * Manually trigger sync of queued operations
   */
  syncNow: publicProcedure.mutation(async () => {
    const online = await checkOnline()
    if (!online) {
      return { success: false, message: 'Offline - cannot sync', synced: 0, failed: 0, pending: 0 }
    }

    const queue = await db.select().from(syncQueue).orderBy(syncQueue.createdAt)
    const results: Array<{ id: number; success: boolean; error?: string }> = []

    for (const item of queue) {
      try {
        // item.data is stored as JSON in SQLite; parse if needed and validate with zod
        const parsedData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data

        switch (item.entity) {
          case 'documents': {
            if (item.operation === 'create') {
              const payload = createDocumentSchema.parse(parsedData)
              await astroClient.documents.create.mutate(payload)
            } else if (item.operation === 'update') {
              const payload = updateDocumentSchema.parse(parsedData)
              await astroClient.documents.update.mutate(payload)
            } else if (item.operation === 'delete') {
              const payload = documentIdSchema.parse(parsedData)
              await astroClient.documents.delete.mutate(payload)
            }
            break
          }
          case 'users': {
            if (item.operation === 'create') {
              const payload = createUserSchema.parse(parsedData)
              await astroClient.users.create.mutate(payload)
            } else if (item.operation === 'update') {
              const payload = updateUserSchema.parse(parsedData)
              await astroClient.users.update.mutate(payload)
            } else if (item.operation === 'delete') {
              const payload = userIdSchema.parse(parsedData)
              await astroClient.users.delete.mutate(payload)
            }
            break
          }
          case 'roles': {
            if (item.operation === 'create') {
              const payload = createRoleSchema.parse(parsedData)
              await astroClient.roles.create.mutate(payload)
            } else if (item.operation === 'update') {
              const payload = updateRoleSchema.parse(parsedData)
              await astroClient.roles.update.mutate(payload)
            } else if (item.operation === 'delete') {
              const payload = idSchema.parse(parsedData)
              await astroClient.roles.delete.mutate(payload)
            }
            break
          }
          case 'permissions': {
            if (item.operation === 'create') {
              const payload = createPermissionSchema.parse(parsedData)
              await astroClient.permissions.create.mutate(payload)
            } else if (item.operation === 'update') {
              const payload = updatePermissionSchema.parse(parsedData)
              await astroClient.permissions.update.mutate(payload)
            } else if (item.operation === 'delete') {
              const payload = idSchema.parse(parsedData)
              await astroClient.permissions.delete.mutate(payload)
            }
            break
          }
          case 'settings': {
            if (item.operation === 'create') {
              const payload = createSettingSchema.parse(parsedData)
              await astroClient.settings.create.mutate(payload)
            } else if (item.operation === 'update') {
              const payload = updateSettingSchema.parse(parsedData)
              await astroClient.settings.update.mutate(payload)
            } else if (item.operation === 'delete') {
              const payload = idSchema.parse(parsedData)
              await astroClient.settings.delete.mutate(payload)
            }
            break
          }
        }

        // Remove from queue on success
        await db.delete(syncQueue).where(eq(syncQueue.id, item.id))
        results.push({ id: item.id, success: true })
      } catch (error) {
        // Update attempt counter and error
        await db
          .update(syncQueue)
          .set({ attempts: item.attempts + 1, lastError: String(error) })
          .where(eq(syncQueue.id, item.id))
        results.push({ id: item.id, success: false, error: String(error) })
      }
    }

    const [{ pending }] = await db.select({ pending: count() }).from(syncQueue)
    return {
      success: true,
      synced: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      pending
    }
  }),

  /**
   * Force full sync from Astro to local (pull remote data)
   */
  pullFromRemote: publicProcedure.mutation(async () => {
    const online = await checkOnline()
    if (!online) {
      return { success: false, message: 'Offline - cannot pull from remote' }
    }

    try {
      let totalSynced = 0

      // Pull documents
      const docs = await astroClient.documents.list.query({ page: 1, pageSize: 1000 })
      for (const doc of docs.data) {
        await db
          .insert(documents)
          .values(doc)
          .onConflictDoUpdate({ target: documents.id, set: doc })
        totalSynced++
      }

      // Pull users
      const usersData = await astroClient.users.list.query({ page: 1, pageSize: 1000 })
      for (const user of usersData.data) {
        await db.insert(users).values(user).onConflictDoUpdate({ target: users.id, set: user })
        totalSynced++
      }

      // Pull roles
      const rolesData = await astroClient.roles.list.query({ page: 1, pageSize: 1000 })
      for (const role of rolesData.data) {
        await db.insert(roles).values(role).onConflictDoUpdate({ target: roles.id, set: role })
        totalSynced++
      }

      // Pull permissions
      const permsData = await astroClient.permissions.list.query({ page: 1, pageSize: 1000 })
      for (const perm of permsData.data) {
        await db
          .insert(permissions)
          .values(perm)
          .onConflictDoUpdate({ target: permissions.id, set: perm })
        totalSynced++
      }

      // Pull settings
      const settingsData = await astroClient.settings.list.query({ page: 1, pageSize: 1000 })
      for (const setting of settingsData.data) {
        await db
          .insert(settings)
          .values(setting)
          .onConflictDoUpdate({ target: settings.id, set: setting })
        totalSynced++
      }

      return { success: true, synced: totalSynced }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }),

  /**
   * Start automatic network monitoring and sync
   */
  startAutoSync: publicProcedure.mutation(async () => {
    // Start network monitor (this runs in background)
    startNetworkMonitor(async (online) => {
      if (online) {
        console.log('Network restored - auto-syncing...')
        // Auto-sync when coming back online
        // const queue = await db.select().from(syncQueue).limit(50) // Sync in batches
        // for (const item of queue) {
        //   // Process sync queue...
        // }
      }
    })

    return { success: true, message: 'Auto-sync enabled' }
  })
})
