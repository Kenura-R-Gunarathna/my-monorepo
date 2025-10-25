// packages/trpc-api/src/trpc.ts
import { initTRPC } from '@trpc/server'

export const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

export type Context = {
  // Add your context here (user, db, etc.)
}
