import { dbConn } from './db';
import { documents } from './schema';

async function seed() {
  console.log('🌱 Seeding database-desktop...');
  
  // Seed Documents (Electron-specific data)
  console.log('Creating documents...');
  const documentsData = [
    { header: 'Desktop Application Framework', type: 'Technical content', status: 'Done', target: 30, limit: 35, reviewer: 'Alice Johnson' },
    { header: 'Native Platform Integration', type: 'Technical content', status: 'Done', target: 22, limit: 26, reviewer: 'Alice Johnson' },
    { header: 'Offline Data Synchronization', type: 'Narrative', status: 'In Process', target: 14, limit: 18, reviewer: 'Bob Martinez' },
    { header: 'Local Storage Management', type: 'Technical content', status: 'Done', target: 18, limit: 21, reviewer: 'Alice Johnson' },
    { header: 'Auto-Update Mechanism', type: 'Narrative', status: 'In Process', target: 12, limit: 15, reviewer: 'Bob Martinez' },
    { header: 'IPC Communication Patterns', type: 'Narrative', status: 'In Process', target: 16, limit: 20, reviewer: 'Bob Martinez' },
    { header: 'Native Menu Implementation', type: 'Technical content', status: 'Done', target: 8, limit: 10, reviewer: 'Carol Thompson' },
    { header: 'System Tray Integration', type: 'Technical content', status: 'Done', target: 6, limit: 8, reviewer: 'Carol Thompson' },
    { header: 'File System Access', type: 'Narrative', status: 'In Process', target: 10, limit: 13, reviewer: 'Dan Wilson' },
    { header: 'Window State Management', type: 'Narrative', status: 'Done', target: 7, limit: 9, reviewer: 'Dan Wilson' },
    { header: 'Keyboard Shortcuts', type: 'Plain language', status: 'Done', target: 4, limit: 5, reviewer: 'Carol Thompson' },
    { header: 'Hardware Acceleration', type: 'Technical content', status: 'Done', target: 15, limit: 18, reviewer: 'Alice Johnson' },
    { header: 'Native Notifications', type: 'Narrative', status: 'In Process', target: 9, limit: 11, reviewer: 'Bob Martinez' },
    { header: 'Print Functionality', type: 'Technical content', status: 'Done', target: 11, limit: 14, reviewer: 'Carol Thompson' },
    { header: 'Deep Linking Protocol', type: 'Narrative', status: 'Done', target: 13, limit: 16, reviewer: 'Dan Wilson' },
    { header: 'Crash Reporting System', type: 'Narrative', status: 'In Process', target: 17, limit: 21, reviewer: 'Dan Wilson' },
    { header: 'Application Packaging', type: 'Technical content', status: 'Done', target: 20, limit: 24, reviewer: 'Alice Johnson' },
    { header: 'Code Signing Process', type: 'Narrative', status: 'In Process', target: 19, limit: 23, reviewer: 'Bob Martinez' },
    { header: 'Multi-window Management', type: 'Plain language', status: 'Done', target: 5, limit: 7, reviewer: 'Carol Thompson' },
    { header: 'Secure Storage Implementation', type: 'Narrative', status: 'Done', target: 21, limit: 25, reviewer: 'Dan Wilson' }
  ];

  await dbConn.insert(documents).values(documentsData);
  console.log(`✅ Created ${documentsData.length} documents`);

  console.log('✅ Database-desktop seeded successfully!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
