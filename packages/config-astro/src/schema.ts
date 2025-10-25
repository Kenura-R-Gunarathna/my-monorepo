import { z } from 'zod'

export const astroConfigSchema = z.object({
  // API Configuration
  API_URL: z.string().url(),
  PORT: z.string().regex(/^\d+$/).transform(Number),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // Optional
  SESSION_SECRET: z.string().optional(),
  JWT_SECRET: z.string().optional(),
})

export type AstroConfig = z.infer<typeof astroConfigSchema>
