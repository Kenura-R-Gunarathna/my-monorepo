// apps/astro-web/src/pages/api/[...all].ts
import type { APIRoute } from 'astro'
import app from '../../server/index'

export const ALL: APIRoute = async (context) => {
  return app.fetch(context.request)
}
