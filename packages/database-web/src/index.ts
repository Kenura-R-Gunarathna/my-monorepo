// Re-export core tables and types
export * from '@krag/database-core';

// Export web-specific tables
export * from '@/packages/database-web/schema';

// Export web database connection
export { getWebDb } from '@/packages/database-web/connection';