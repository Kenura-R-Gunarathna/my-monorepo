import { z } from 'zod'

export const astroConfigSchema = z.object({
  // API Configuration
  API_URL: z.string().url(),
  PORT: z.string().regex(/^\d+$/).transform(Number),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // Authentication - OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Authentication - Email Provider
  RESEND_API_KEY: z.string().optional(),
  
  // Session & JWT
  SESSION_SECRET: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().optional(),
})

export type AstroConfig = z.infer<typeof astroConfigSchema>
