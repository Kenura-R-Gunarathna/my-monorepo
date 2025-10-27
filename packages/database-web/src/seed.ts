import { getWebDb } from '@/packages/database-web/connection';
import { user } from '@krag/better-auth';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database-web...');
  
  const db = getWebDb();

  // Example: Insert sample users
  const newUser = await db.insert(user).values([
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
