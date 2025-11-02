import { router, publicProcedure } from '../../trpc'
import {
  paginationSchema,
  idSchema,
  createDocumentSchema,
  updateDocumentSchema
} from '@krag/zod-schema'
import { documents, syncQueue } from '@krag/drizzle-orm-client'
import { eq, desc, asc, count, like, and, or } from 'drizzle-orm'
import { db } from '../../database'
import { astroClient, checkOnline } from '../astro-client'

export const documentsRouter = router({
  /**
   * LIST - Read from local SQLite, sync in background
   */
  list: publicProcedure.input(paginationSchema).query(async ({ input }) => {
    const { page, pageSize, sortBy, sortOrder, search, status, type } = input
    const offset = (page - 1) * pageSize

    // 1️⃣ ALWAYS read from local SQLite (instant response)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = []

    if (search) {
      conditions.push(
        or(like(documents.header, `%${search}%`), like(documents.reviewer, `%${search}%`))
      )
    }
    if (status) conditions.push(eq(documents.status, status))
    if (type) conditions.push(eq(documents.type, type))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ total }] = await db.select({ total: count() }).from(documents).where(whereClause)

    const orderByColumn =
      sortBy === 'header'
        ? documents.header
        : sortBy === 'type'
          ? documents.type
          : sortBy === 'status'
            ? documents.status
            : documents.createdAt

    const localData = await db
      .select()
      .from(documents)
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(orderByColumn) : asc(orderByColumn))
      .limit(pageSize)
      .offset(offset)

    // 2️⃣ Try to sync with Astro backend in background (non-blocking)
    const online = await checkOnline()
    if (online) {
      // Fire and forget - sync in background
      astroClient.documents.list
        .query(input)
        .then(async (remoteData) => {
          // Merge remote data into local SQLite
          for (const doc of remoteData.data) {
            await db.insert(documents).values(doc).onConflictDoUpdate({
              target: documents.id,
              set: doc
            })
          }
        })
        .catch((err) => console.warn('Background sync failed:', err))
    }

    return {
      data: localData,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      },
      _meta: {
        offline: !online,
        source: 'local-sqlite'
      }
    }
  }),

  /**
   * GET BY ID - Read from local
   */
  getById: publicProcedure.input(idSchema).query(async ({ input }) => {
    const [document] = await db.select().from(documents).where(eq(documents.id, input.id)).limit(1)

    if (!document) {
      throw new Error('Document not found')
    }

    return document
  }),

  /**
   * CREATE - Write to local, queue for remote sync
   */
  create: publicProcedure.input(createDocumentSchema).mutation(async ({ input }) => {
    // 1️⃣ Create in local SQLite immediately
    const [newDoc] = await db.insert(documents).values(input).returning({ id: documents.id })

    // 2️⃣ Try to sync to Astro backend
    const online = await checkOnline()
    if (online) {
      try {
        const remoteDoc = await astroClient.documents.create.mutate(input)
        // Update local with remote ID if different
        if (remoteDoc.id !== newDoc.id) {
          await db.update(documents).set({ id: remoteDoc.id }).where(eq(documents.id, newDoc.id))
        }
      } catch (error) {
        console.warn('Failed to sync create to remote, queuing...', error)
        await db.insert(syncQueue).values({
          operation: 'create',
          entity: 'documents',
          data: input,
          localId: String(newDoc.id)
        })
      }
    } else {
      // Offline - queue for later
      await db.insert(syncQueue).values({
        operation: 'create',
        entity: 'documents',
        data: input,
        localId: String(newDoc.id)
      })
    }

    return {
      id: newDoc.id,
      success: true,
      _meta: { synced: online }
    }
  }),

  /**
   * UPDATE - Update local, sync to remote
   */
  update: publicProcedure.input(updateDocumentSchema).mutation(async ({ input }) => {
    const { id, ...data } = input

    // 1️⃣ Update local SQLite
    await db.update(documents).set(data).where(eq(documents.id, id))

    // 2️⃣ Try to sync to Astro backend
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.documents.update.mutate(input)
      } catch (error) {
        console.warn('Failed to sync update to remote, queuing...', error)
        await db.insert(syncQueue).values({
          operation: 'update',
          entity: 'documents',
          data: input,
          localId: String(id)
        })
      }
    } else {
      await db.insert(syncQueue).values({
        operation: 'update',
        entity: 'documents',
        data: input,
        localId: String(id)
      })
    }

    return {
      success: true,
      _meta: { synced: online }
    }
  }),

  /**
   * DELETE - Delete local, sync to remote
   */
  delete: publicProcedure.input(idSchema).mutation(async ({ input }) => {
    // 1️⃣ Delete from local SQLite
    await db.delete(documents).where(eq(documents.id, input.id))

    // 2️⃣ Try to sync to Astro backend
    const online = await checkOnline()
    if (online) {
      try {
        await astroClient.documents.delete.mutate(input)
      } catch (error) {
        console.warn('Failed to sync delete to remote, queuing...', error)
        await db.insert(syncQueue).values({
          operation: 'delete',
          entity: 'documents',
          data: input,
          localId: String(input.id)
        })
      }
    } else {
      await db.insert(syncQueue).values({
        operation: 'delete',
        entity: 'documents',
        data: input,
        localId: String(input.id)
      })
    }

    return {
      success: true,
      _meta: { synced: online }
    }
  })
})
