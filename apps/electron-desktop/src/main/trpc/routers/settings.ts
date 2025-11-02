import { router, publicProcedure } from '../../trpc'
import {
  settingsPaginationSchema,
  idSchema,
  createSettingSchema,
  updateSettingSchema
} from '@krag/zod-schema'
import { settings, syncQueue } from '@krag/drizzle-orm-client'
import { eq, desc, asc, count, like, and, or } from 'drizzle-orm'
import { db } from '../../database'
import { astroClient, checkOnline } from '../astro-client'
import { z } from '@krag/zod-schema/documents'

const settingKeySchema = z.object({ key: z.string() })

export const settingsRouter = router({
  list: publicProcedure.input(settingsPaginationSchema).query(async ({ input }) => {
    const { page, pageSize, sortBy, sortOrder, search, category, isPublic } = input
    const offset = (page - 1) * pageSize
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = []
    if (search) {
      conditions.push(or(like(settings.key, `%${search}%`)))
    }
    if (category) conditions.push(eq(settings.category, category))
    if (isPublic !== undefined) conditions.push(eq(settings.isPublic, isPublic))
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const [{ total }] = await db.select({ total: count() }).from(settings).where(whereClause)
    const orderByColumn = sortBy === 'key' ? settings.key : settings.createdAt
    const localData = await db
      .select()
      .from(settings)
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(orderByColumn) : asc(orderByColumn))
      .limit(pageSize)
      .offset(offset)
    const online = await checkOnline()
    if (online) {
      astroClient.settings.list
        .query(input)
        .then(async (remoteData) => {
          for (const setting of remoteData.data) {
            await db
              .insert(settings)
              .values(setting)
              .onConflictDoUpdate({ target: settings.id, set: setting })
          }
        })
        .catch((err) => console.warn('Background sync failed:', err))
    }
    return {
      data: localData,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      _meta: { offline: !online, source: 'local-sqlite' }
    }
  }),
  getById: publicProcedure.input(idSchema).query(async ({ input }) => {
    const [setting] = await db.select().from(settings).where(eq(settings.id, input.id)).limit(1)
    if (!setting) throw new Error('Setting not found')
    return setting
  }),
  getByKey: publicProcedure.input(settingKeySchema).query(async ({ input }) => {
    const [setting] = await db.select().from(settings).where(eq(settings.key, input.key)).limit(1)
    if (!setting) throw new Error('Setting not found')
    return setting
  }),
  getPublic: publicProcedure.query(async () => {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.isPublic, true))
      .orderBy(asc(settings.key))
    return result.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as Record<string, any>
    )
  }),
  create: publicProcedure.input(createSettingSchema).mutation(async ({ input }) => {
    const data = { ...input, value: input.value ?? null }
    const [newSetting] = await db.insert(settings).values(data).returning({ id: settings.id })
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.settings.create.mutate(input)
      } catch {
        await db.insert(syncQueue).values({
          operation: 'create',
          entity: 'settings',
          data: input,
          localId: String(newSetting.id)
        })
      }
    } else {
      await db.insert(syncQueue).values({
        operation: 'create',
        entity: 'settings',
        data: input,
        localId: String(newSetting.id)
      })
    }
    return { id: newSetting.id, success: true, _meta: { synced: online } }
  }),
  update: publicProcedure.input(updateSettingSchema).mutation(async ({ input }) => {
    const { id, ...data } = input
    await db.update(settings).set(data).where(eq(settings.id, id))
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.settings.update.mutate(input)
      } catch {
        await db
          .insert(syncQueue)
          .values({ operation: 'update', entity: 'settings', data: input, localId: String(id) })
      }
    } else {
      await db
        .insert(syncQueue)
        .values({ operation: 'update', entity: 'settings', data: input, localId: String(id) })
    }
    return { success: true, _meta: { synced: online } }
  }),
  delete: publicProcedure.input(idSchema).mutation(async ({ input }) => {
    await db.delete(settings).where(eq(settings.id, input.id))
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.settings.delete.mutate(input)
      } catch {
        await db.insert(syncQueue).values({
          operation: 'delete',
          entity: 'settings',
          data: input,
          localId: String(input.id)
        })
      }
    } else {
      await db
        .insert(syncQueue)
        .values({ operation: 'delete', entity: 'settings', data: input, localId: String(input.id) })
    }
    return { success: true, _meta: { synced: online } }
  })
})
