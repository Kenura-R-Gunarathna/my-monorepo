import { defineConfig } from 'drizzle-kit';
import { getConfig } from '@krag/config/client';

const config = getConfig();

export default defineConfig({
  out: './drizzle',
  schema: './src/schema/*.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: config.DB_FILE_NAME,
  },
});
