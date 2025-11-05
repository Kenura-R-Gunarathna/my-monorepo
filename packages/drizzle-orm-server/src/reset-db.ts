/**
 * Reset database - clears all data from tables
 * WARNING: This will delete ALL data!
 */

import { dbConn } from './index';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
  console.log('🗑️  Resetting database...\n');
  
  try {
    // Disable foreign key checks temporarily
    await dbConn.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
    
    // Clear all tables in reverse dependency order
    const tables = [
      'user_permissions',
      'role_permissions',
      'documents',
      'settings',
      'permissions',
      'roles',
      'verification',
      'session',
      'account',
      'user',
      'analytics',
    ];
    
    for (const table of tables) {
      try {
        await dbConn.execute(sql.raw(`TRUNCATE TABLE \`${table}\``));
        console.log(`✅ Cleared table: ${table}`);
      } catch (error: any) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.log(`⚠️  Table ${table} does not exist (skipping)`);
        } else {
          console.error(`❌ Error clearing ${table}:`, error.message);
        }
      }
    }
    
    // Re-enable foreign key checks
    await dbConn.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
    
    console.log('\n🎉 Database reset completed successfully!');
    console.log('   You can now run: pnpm db:seed\n');
    
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

resetDatabase()
  .then(() => {
    console.log('Reset script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Reset script failed:', error);
    process.exit(1);
  });
