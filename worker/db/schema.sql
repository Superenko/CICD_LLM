-- DEV ONLY: Reset script for local development
-- WARNING: This will DROP all tables and data!
-- For production, use migrations instead: npm run db:migrate

DROP TABLE IF EXISTS models;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS incidents;

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
  github_repo_id TEXT NOT NULL UNIQUE,
  name VARCHAR(75) NOT NULL,
  html_url TEXT,
  latest_deployment_status VARCHAR(50),
  latest_deployment_at INTEGER,
  synced_at INTEGER NOT NULL DEFAULT (unixepoch())
);

DROP INDEX IF EXISTS idx_projects_github_repo_id;
CREATE INDEX IF NOT EXISTS idx_projects_github_repo_id ON projects(github_repo_id);
DROP INDEX IF EXISTS idx_projects_name;
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
DROP INDEX IF EXISTS idx_projects_synced_at;
CREATE INDEX IF NOT EXISTS idx_projects_synced_at ON projects(synced_at);

CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name VARCHAR(75) NOT NULL,
  run_id TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  solution TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);