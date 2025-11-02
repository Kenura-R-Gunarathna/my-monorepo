import { router, publicProcedure } from '../../trpc'
import {
  usersPaginationSchema,
  userIdSchema,
  createUserSchema,
  updateUserSchema
} from '@krag/zod-schema'
import { users, syncQueue } from '@krag/drizzle-orm-client'
import { eq, desc, asc, count, like, and, or } from 'drizzle-orm'
import { db } from '../../database'
import { astroClient, checkOnline } from '../astro-client'
import { randomUUID } from 'crypto'

export const usersRouter = router({
  list: publicProcedure.input(usersPaginationSchema).query(async ({ input }) => {
    const { page, pageSize, sortBy, sortOrder, search, isActive, roleId } = input
    const offset = (page - 1) * pageSize

    // 1️⃣ ALWAYS read from local SQLite (instant response)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = []
    if (search) {
      conditions.push(or(like(users.name, `%${search}%`), like(users.email, `%${search}%`)))
    }
    if (isActive !== undefined) conditions.push(eq(users.isActive, isActive))
    if (roleId !== undefined) conditions.push(eq(users.roleId, roleId))
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const [{ total }] = await db.select({ total: count() }).from(users).where(whereClause)
    const orderByColumn =
      sortBy === 'name' ? users.name : sortBy === 'email' ? users.email : users.createdAt
    const localData = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(orderByColumn) : asc(orderByColumn))
      .limit(pageSize)
      .offset(offset)
    const online = await checkOnline()
    if (online) {
      astroClient.users.list
        .query(input)
        .then(async (remoteData) => {
          for (const user of remoteData.data) {
            await db.insert(users).values(user).onConflictDoUpdate({ target: users.id, set: user })
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

  getById: publicProcedure.input(userIdSchema).query(async ({ input }) => {
    const [user] = await db.select().from(users).where(eq(users.id, input.id)).limit(1)
    if (!user) throw new Error('User not found')
    return user
  }),

  create: publicProcedure.input(createUserSchema).mutation(async ({ input }) => {
    // Generate a local ID for SQLite
    const localId = randomUUID()
    const [newUser] = await db
      .insert(users)
      .values({ ...input, id: localId })
      .returning({ id: users.id })

    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.users.create.mutate(input)
      } catch {
        await db
          .insert(syncQueue)
          .values({ operation: 'create', entity: 'users', data: input, localId: newUser.id })
      }
    } else {
      await db
        .insert(syncQueue)
        .values({ operation: 'create', entity: 'users', data: input, localId: newUser.id })
    }
    return { id: newUser.id, success: true, _meta: { synced: online } }
  }),

  update: publicProcedure.input(updateUserSchema).mutation(async ({ input }) => {
    const { id, ...data } = input
    await db.update(users).set(data).where(eq(users.id, id))
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.users.update.mutate(input)
      } catch {
        await db
          .insert(syncQueue)
          .values({ operation: 'update', entity: 'users', data: input, localId: id })
      }
    } else {
      await db
        .insert(syncQueue)
        .values({ operation: 'update', entity: 'users', data: input, localId: id })
    }
    return { success: true, _meta: { synced: online } }
  }),

  delete: publicProcedure.input(userIdSchema).mutation(async ({ input }) => {
    await db.delete(users).where(eq(users.id, input.id))
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.users.delete.mutate(input)
      } catch {
        await db
          .insert(syncQueue)
          .values({ operation: 'delete', entity: 'users', data: input, localId: input.id })
      }
    } else {
      await db
        .insert(syncQueue)
        .values({ operation: 'delete', entity: 'users', data: input, localId: input.id })
    }
    return { success: true, _meta: { synced: online } }
  })
})
