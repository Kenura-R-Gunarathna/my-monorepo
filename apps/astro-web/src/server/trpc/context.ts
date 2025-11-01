import type { APIContext } from 'astro'
import { auth } from '../../lib/auth'
import { dbConn } from '@krag/database-astro'

export interface Context {
  session: Awaited<ReturnType<typeof auth.api.getSession>>
  db: typeof dbConn
}

/**
 * Creates tRPC context for API requests
 * - Fetches session from Better Auth
 * - Provides database access via database-web
 * 
 * Supports both Astro APIContext and raw Request objects
 */
export async function createContext(
  opts: { ctx: APIContext } | { req: Request }
): Promise<Context> {
  // Extract request headers from either APIContext or Request
  const headers = 'ctx' in opts ? opts.ctx.request.headers : opts.req.headers

  // Get session from Better Auth
  const session = await auth.api.getSession({ headers })

  return {
    session,
    db: dbConn,
  }
}

export type TRPCContext = Awaited<ReturnType<typeof createContext>>
