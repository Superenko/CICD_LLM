-- DEV ONLY: Reset script for local development
-- WARNING: This will DROP all tables and data!
-- For production, use migrations instead: npm run db:migrate

DROP TABLE IF EXISTS models;
DROP TABLE IF EXISTS projects;

CREATE TABLE IF NOT EXISTS models (
	id INTEGER PRIMARY KEY AUTOINCREMENT, 
	name VARCHAR(50) NOT NULL UNIQUE, 
	synced_at INTEGER NOT NULL DEFAULT (unixepoch())
);

DROP INDEX IF EXISTS idx_models_name;
CREATE INDEX IF NOT EXISTS idx_models_name ON models(name);
DROP INDEX IF EXISTS idx_models_synced_at;
CREATE INDEX IF NOT EXISTS idx_models_synced_at ON models(synced_at);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cloudflare_id TEXT NOT NULL UNIQUE,
  name VARCHAR(75) NOT NULL,
  domains TEXT,
  latest_deployment_status VARCHAR(50),
  latest_deployment_at INTEGER,
  synced_at INTEGER NOT NULL DEFAULT (unixepoch())
);

DROP INDEX IF EXISTS idx_projects_cloudflare_id;
CREATE INDEX IF NOT EXISTS idx_projects_cloudflare_id ON projects(cloudflare_id);
DROP INDEX IF EXISTS idx_projects_name;
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
DROP INDEX IF EXISTS idx_projects_synced_at;
CREATE INDEX IF NOT EXISTS idx_projects_synced_at ON projects(synced_at);