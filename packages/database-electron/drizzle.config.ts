import { defineConfig } from 'drizzle-kit';
import { config } from '@krag/config-electron';

export default defineConfig({
  out: './drizzle',
  schema: './src/schema/*.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: config.DB_FILE_NAME,
  },
});
