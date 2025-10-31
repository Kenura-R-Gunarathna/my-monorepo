import { z } from 'zod'

export const astroConfigSchema = z.object({
  BASE_URL: z.string().url().default('http://localhost:4321'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().default('file:./dev.db'),
  
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  
  IS_DEV: z.string().default('true').transform((val:any) => val === 'true'),
})

export type AstroConfig = z.infer<typeof astroConfigSchema>


export const electronConfigSchema = z.object({
  API_URL: z.string().url().default('http://localhost:4321'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  DB_FILE_NAME: z.string().default('app.db'),
  
  WINDOW_WIDTH: z.string().regex(/^\d+$/).transform(Number).default('1200'),
  WINDOW_HEIGHT: z.string().regex(/^\d+$/).transform(Number).default('800'),

  AUTO_UPDATE_URL: z.string().url().optional().or(z.literal('')),
  
  IS_DEV: z.string().default('true').transform((val:any) => val === 'true'),
})

export type ElectronConfig = z.infer<typeof electronConfigSchema>
