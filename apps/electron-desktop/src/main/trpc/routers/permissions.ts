import { router, publicProcedure } from '../../trpc'
import {
  permissionsPaginationSchema,
  idSchema,
  createPermissionSchema,
  updatePermissionSchema
} from '@krag/zod-schema'
import { permissions, syncQueue } from '@krag/drizzle-orm-client'
import { eq, desc, asc, count, like, and, or } from 'drizzle-orm'
import { db } from '../../database'
import { astroClient, checkOnline } from '../astro-client'

export const permissionsRouter = router({
  list: publicProcedure.input(permissionsPaginationSchema).query(async ({ input }) => {
    const { page, pageSize, sortBy, sortOrder, search, resource, action, category, isActive } =
      input
    const offset = (page - 1) * pageSize
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = []
    if (search) {
      conditions.push(or(like(permissions.name, `%${search}%`)))
    }
    if (resource) conditions.push(eq(permissions.resource, resource))
    if (action) conditions.push(eq(permissions.action, action))
    if (category) conditions.push(eq(permissions.category, category))
    if (isActive !== undefined) conditions.push(eq(permissions.isActive, isActive))
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const [{ total }] = await db.select({ total: count() }).from(permissions).where(whereClause)
    const orderByColumn = sortBy === 'name' ? permissions.name : permissions.createdAt
    const localData = await db
      .select()
      .from(permissions)
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(orderByColumn) : asc(orderByColumn))
      .limit(pageSize)
      .offset(offset)
    const online = await checkOnline()
    if (online) {
      astroClient.permissions.list
        .query(input)
        .then(async (remoteData) => {
          for (const perm of remoteData.data) {
            await db
              .insert(permissions)
              .values(perm)
              .onConflictDoUpdate({ target: permissions.id, set: perm })
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
    const [permission] = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, input.id))
      .limit(1)
    if (!permission) throw new Error('Permission not found')
    return permission
  }),
  create: publicProcedure.input(createPermissionSchema).mutation(async ({ input }) => {
    const [newPerm] = await db.insert(permissions).values(input).returning({ id: permissions.id })
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.permissions.create.mutate(input)
      } catch {
        await db.insert(syncQueue).values({
          operation: 'create',
          entity: 'permissions',
          data: input,
          localId: String(newPerm.id)
        })
      }
    } else {
      await db.insert(syncQueue).values({
        operation: 'create',
        entity: 'permissions',
        data: input,
        localId: String(newPerm.id)
      })
    }
    return { id: newPerm.id, success: true, _meta: { synced: online } }
  }),
  update: publicProcedure.input(updatePermissionSchema).mutation(async ({ input }) => {
    const { id, ...data } = input
    await db.update(permissions).set(data).where(eq(permissions.id, id))
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.permissions.update.mutate(input)
      } catch {
        await db
          .insert(syncQueue)
          .values({ operation: 'update', entity: 'permissions', data: input, localId: String(id) })
      }
    } else {
      await db
        .insert(syncQueue)
        .values({ operation: 'update', entity: 'permissions', data: input, localId: String(id) })
    }
    return { success: true, _meta: { synced: online } }
  }),
  delete: publicProcedure.input(idSchema).mutation(async ({ input }) => {
    await db.delete(permissions).where(eq(permissions.id, input.id))
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.permissions.delete.mutate(input)
      } catch {
        await db.insert(syncQueue).values({
          operation: 'delete',
          entity: 'permissions',
          data: input,
          localId: String(input.id)
        })
      }
    } else {
      await db.insert(syncQueue).values({
        operation: 'delete',
        entity: 'permissions',
        data: input,
        localId: String(input.id)
      })
    }
    return { success: true, _meta: { synced: online } }
  })
})
