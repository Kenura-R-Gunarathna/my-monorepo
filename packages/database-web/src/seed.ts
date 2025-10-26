import { getWebDb } from './connection';
import { users } from '@krag/database-core';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database-web...');
  
  const db = getWebDb();

  // Example: Insert sample users
  const newUser = await db.insert(users).values([
    {
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
    },
    {
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      isActive: true,
    },
  ]);

  console.log('✅ Inserted users:', newUser);

  // Add your web-specific seeding here
  // Example: Insert posts, comments, etc.

  console.log('✅ Database-web seeded successfully!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
