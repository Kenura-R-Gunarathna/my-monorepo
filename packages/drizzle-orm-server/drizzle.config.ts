import { defineConfig } from 'drizzle-kit';
import { getServerConfig } from '@krag/config/server';

const config = getServerConfig();

export default defineConfig({
  out: './drizzle',
  schema: './src/schema/*.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: config.DATABASE_URL,
  },
});
