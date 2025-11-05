-- up
CREATE TABLE IF NOT EXISTS sync_metadata (
  table_name VARCHAR(255) PRIMARY KEY,
  last_synced_at DATETIME,
  sync_status VARCHAR(50) DEFAULT 'pending'
);

-- down
DROP TABLE IF NOT EXISTS sync_metadata;
