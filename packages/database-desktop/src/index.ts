// Re-export core tables and types
export * from '@krag/database-core';

// Export desktop-specific tables
export * from './schema';

// Export desktop database connection
export { getDesktopDb, type DesktopDb } from './connection';
