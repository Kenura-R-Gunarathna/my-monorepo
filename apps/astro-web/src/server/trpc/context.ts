// apps/astro-web/src/server/trpc/context.ts
import type { APIContext } from 'astro'
import { auth } from '../../auth'
import { getWebDb } from '@krag/database-astro'

export interface Context {
  session: Awaited<ReturnType<typeof auth.api.getSession>>
  db: ReturnType<typeof getWebDb>
}

/**
 * Creates tRPC context for API requests
 * - Fetches session from Better Auth
 * - Provides database access via database-web
 */
export async function createContext(opts: { ctx: APIContext }): Promise<Context> {
  const { ctx } = opts

  // Get session from Better Auth
  const session = await auth.api.getSession({ 
    headers: ctx.request.headers 
  })

  // Get database instance
  const db = getWebDb()

  return {
    session,
    db,
  }
}

export type TRPCContext = Awaited<ReturnType<typeof createContext>>
