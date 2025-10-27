// Re-export core tables and types
export * from '@krag/database-core';

// Export desktop-specific tables
export * from '@/packages/database-desktop/schema';

// Export desktop database connection
export { getDesktopDb, type DesktopDb } from '@/packages/database-desktop/connection';
