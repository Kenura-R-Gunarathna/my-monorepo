import { z } from 'zod'

export const electronConfigSchema = z.object({
  // API Configuration
  API_URL: z.string().url(),
  
  // Window Configuration
  WINDOW_WIDTH: z.string().regex(/^\d+$/).transform(Number).default('1200'),
  WINDOW_HEIGHT: z.string().regex(/^\d+$/).transform(Number).default('800'),
  
  // Auto Update
  AUTO_UPDATE_URL: z.string().url().optional().or(z.literal('')),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // Optional
  ELECTRON_IS_DEV: z.string().optional(),
})

export type ElectronConfig = z.infer<typeof electronConfigSchema>
