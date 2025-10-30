// apps/astro-web/src/pages/api/trpc/[trpc].ts
import type { APIRoute } from 'astro'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../../../server/trpc/routers/_app'
import { createContext } from '../../../server/trpc/context'

/**
 * tRPC API handler for all HTTP methods
 */
const handler: APIRoute = async (ctx) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: ctx.request,
    router: appRouter,
    createContext: () => createContext({ ctx }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}:`,
              error.message
            )
          }
        : undefined,
  })
}

export const GET: APIRoute = handler
export const POST: APIRoute = handler
export const ALL: APIRoute = handler
