import { router, publicProcedure } from '../../trpc'
import {
  rolesPaginationSchema,
  idSchema,
  createRoleSchema,
  updateRoleSchema
} from '@krag/zod-schema'
import { roles, syncQueue } from '@krag/drizzle-orm-client'
import { eq, desc, asc, count, like, and, or } from 'drizzle-orm'
import { db } from '../../database'
import { astroClient, checkOnline } from '../astro-client'

export const rolesRouter = router({
  list: publicProcedure.input(rolesPaginationSchema).query(async ({ input }) => {
    const { page, pageSize, sortBy, sortOrder, search, isActive } = input
    const offset = (page - 1) * pageSize
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = []
    if (search) {
      conditions.push(or(like(roles.name, `%${search}%`), like(roles.description, `%${search}%`)))
    }
    if (isActive !== undefined) conditions.push(eq(roles.isActive, isActive))
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const [{ total }] = await db.select({ total: count() }).from(roles).where(whereClause)
    const orderByColumn = sortBy === 'name' ? roles.name : roles.createdAt
    const localData = await db
      .select()
      .from(roles)
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(orderByColumn) : asc(orderByColumn))
      .limit(pageSize)
      .offset(offset)
    const online = await checkOnline()
    if (online) {
      astroClient.roles.list
        .query(input)
        .then(async (remoteData) => {
          for (const role of remoteData.data) {
            await db.insert(roles).values(role).onConflictDoUpdate({ target: roles.id, set: role })
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
    const [role] = await db.select().from(roles).where(eq(roles.id, input.id)).limit(1)
    if (!role) throw new Error('Role not found')
    return role
  }),

  create: publicProcedure.input(createRoleSchema).mutation(async ({ input }) => {
    const [newRole] = await db.insert(roles).values(input).returning({ id: roles.id })
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.roles.create.mutate(input)
      } catch {
        await db.insert(syncQueue).values({
          operation: 'create',
          entity: 'roles',
          data: input,
          localId: String(newRole.id)
        })
      }
    } else {
      await db
        .insert(syncQueue)
        .values({ operation: 'create', entity: 'roles', data: input, localId: String(newRole.id) })
    }
    return { id: newRole.id, success: true, _meta: { synced: online } }
  }),

  update: publicProcedure.input(updateRoleSchema).mutation(async ({ input }) => {
    const { id, ...data } = input
    await db.update(roles).set(data).where(eq(roles.id, id))
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.roles.update.mutate(input)
      } catch {
        await db
          .insert(syncQueue)
          .values({ operation: 'update', entity: 'roles', data: input, localId: String(id) })
      }
    } else {
      await db
        .insert(syncQueue)
        .values({ operation: 'update', entity: 'roles', data: input, localId: String(id) })
    }
    return { success: true, _meta: { synced: online } }
  }),

  delete: publicProcedure.input(idSchema).mutation(async ({ input }) => {
    await db.delete(roles).where(eq(roles.id, input.id))
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.roles.delete.mutate(input)
      } catch {
        await db
          .insert(syncQueue)
          .values({ operation: 'delete', entity: 'roles', data: input, localId: String(input.id) })
      }
    } else {
      await db
        .insert(syncQueue)
        .values({ operation: 'delete', entity: 'roles', data: input, localId: String(input.id) })
    }
    return { success: true, _meta: { synced: online } }
  }),

  getActive: publicProcedure.query(async () => {
    return await db.select().from(roles).where(eq(roles.isActive, true)).orderBy(asc(roles.name))
  })
})
