import { defineConfig } from 'drizzle-kit';
import { config } from '@krag/config-astro';

export default defineConfig({
  out: './drizzle',
  schema: './src/schema/*.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: config.DATABASE_URL,
  },
});
