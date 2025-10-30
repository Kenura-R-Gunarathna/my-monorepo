import { z } from 'zod'

export const astroConfigSchema = z.object({
  API_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),

  DATABASE_URL: z.string(),
  
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  
  IS_DEV: z.string().default((process.env.ASTRO_MODE === "production" ? false : true)),
})

export type AstroConfig = z.infer<typeof astroConfigSchema>


export const electronConfigSchema = z.object({
  API_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  DB_FILE_NAME: z.string(),
  
  WINDOW_WIDTH: z.string().regex(/^\d+$/).transform(Number).default('1200'),
  WINDOW_HEIGHT: z.string().regex(/^\d+$/).transform(Number).default('800'),

  AUTO_UPDATE_URL: z.string().url().optional().or(z.literal('')),
  
  IS_DEV: z.string().default((process.env.ELECTRON_MODE === "production" ? false : true)),
})

export type AstroConfig = z.infer<typeof electronConfigSchema>
