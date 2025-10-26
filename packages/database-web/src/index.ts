// Re-export core tables and types
export * from '@krag/database-core';

// Export web-specific tables
export * from './schema';

// Export web database connection
export { getWebDb } from './connection';