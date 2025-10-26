import { migrate } from 'drizzle-orm/mysql2/migrator';
import { getDb } from './connection';

async function runMigrations() {
  console.log('🔄 Running migrations...');
  
  const db = await getDb();
  
  await migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('✅ Migrations completed!');
}

runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
  