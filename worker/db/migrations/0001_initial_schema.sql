CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_repo_id TEXT UNIQUE,
  name VARCHAR(75) NOT NULL,
  html_url TEXT,
  latest_deployment_status VARCHAR(50),
  latest_deployment_at INTEGER,
  synced_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_projects_github_repo_id ON projects(github_repo_id);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
CREATE INDEX IF NOT EXISTS idx_projects_synced_at ON projects(synced_at);
