import { getDesktopDb } from './connection';
import { users, localCache } from './index';

async function seed() {
  console.log('🌱 Seeding database-desktop...');
  
  const db = getDesktopDb();

  // Example: Insert sample cache entries
  await db.insert(localCache).values([
    {
      key: 'app:theme',
      value: JSON.stringify({ theme: 'dark', fontSize: 14 }),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    {
      key: 'app:last-sync',
      value: JSON.stringify({ timestamp: new Date().toISOString() }),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  ]);

  console.log('✅ Inserted cache entries');

  // Add your desktop-specific seeding here
  // Example: Insert sync queue items, preferences, etc.

  console.log('✅ Database-desktop seeded successfully!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
