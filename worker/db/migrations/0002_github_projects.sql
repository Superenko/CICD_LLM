-- Migration to replace Cloudflare integration with GitHub repositories

DROP TABLE IF EXISTS projects_new;

CREATE TABLE projects_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_repo_id TEXT NOT NULL UNIQUE,
  name VARCHAR(75) NOT NULL,
  html_url TEXT,
  latest_deployment_status VARCHAR(50),
  latest_deployment_at INTEGER,
  synced_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- We don't migrate data since Cloudflare IDs are fundamentally incompatible with GitHub Repo IDs.
-- The table will just be synced afresh from GitHub on the next sync event.

DROP TABLE projects;
ALTER TABLE projects_new RENAME TO projects;

CREATE INDEX IF NOT EXISTS idx_projects_github_repo_id ON projects(github_repo_id);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
CREATE INDEX IF NOT EXISTS idx_projects_synced_at ON projects(synced_at);
