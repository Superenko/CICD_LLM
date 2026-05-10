-- DEV ONLY: Reset script for local development
-- WARNING: This will DROP all tables and data!
-- For production, use migrations instead: npm run db:migrate

DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS workflow_runs;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

-- ─── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(100) NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

DROP INDEX IF EXISTS idx_users_email;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ─── projects ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  github_repo_id           TEXT    NOT NULL UNIQUE,
  name                     VARCHAR(75) NOT NULL,
  html_url                 TEXT,
  latest_deployment_status VARCHAR(50),
  latest_deployment_at     INTEGER,
  total_runs               INTEGER NOT NULL DEFAULT 0,
  failed_runs              INTEGER NOT NULL DEFAULT 0,
  synced_at                INTEGER NOT NULL DEFAULT (unixepoch())
);

DROP INDEX IF EXISTS idx_projects_github_repo_id;
CREATE INDEX IF NOT EXISTS idx_projects_github_repo_id ON projects(github_repo_id);
DROP INDEX IF EXISTS idx_projects_name;
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
DROP INDEX IF EXISTS idx_projects_synced_at;
CREATE INDEX IF NOT EXISTS idx_projects_synced_at ON projects(synced_at);
DROP INDEX IF EXISTS idx_projects_failed_runs;
CREATE INDEX IF NOT EXISTS idx_projects_failed_runs ON projects(failed_runs);

-- ─── workflow_runs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_runs (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name     VARCHAR(75) NOT NULL,
  run_id           TEXT        NOT NULL UNIQUE,
  status           VARCHAR(50),
  conclusion       VARCHAR(50),
  triggered_by     VARCHAR(50),
  started_at       INTEGER,
  completed_at     INTEGER,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN completed_at IS NOT NULL AND started_at IS NOT NULL
      THEN completed_at - started_at
      ELSE NULL
    END
  ) VIRTUAL,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

DROP INDEX IF EXISTS idx_workflow_runs_project_name;
CREATE INDEX IF NOT EXISTS idx_workflow_runs_project_name    ON workflow_runs(project_name);
DROP INDEX IF EXISTS idx_workflow_runs_run_id;
CREATE INDEX IF NOT EXISTS idx_workflow_runs_run_id          ON workflow_runs(run_id);
DROP INDEX IF EXISTS idx_workflow_runs_conclusion;
CREATE INDEX IF NOT EXISTS idx_workflow_runs_conclusion      ON workflow_runs(conclusion);
DROP INDEX IF EXISTS idx_workflow_runs_created_at;
CREATE INDEX IF NOT EXISTS idx_workflow_runs_created_at      ON workflow_runs(created_at);
DROP INDEX IF EXISTS idx_workflow_runs_project_created;
CREATE INDEX IF NOT EXISTS idx_workflow_runs_project_created ON workflow_runs(project_name, created_at);

-- ─── incidents ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name        VARCHAR(75) NOT NULL,
  run_id              TEXT        NOT NULL UNIQUE,
  category            VARCHAR(50) NOT NULL,
  severity            VARCHAR(20),
  root_cause          TEXT,
  solution            TEXT        NOT NULL,
  actionable_commands TEXT,
  llm_model           VARCHAR(75),
  confidence_score    REAL,
  raw_log_snippet     TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

DROP INDEX IF EXISTS idx_incidents_project_name;
CREATE INDEX IF NOT EXISTS idx_incidents_project_name    ON incidents(project_name);
DROP INDEX IF EXISTS idx_incidents_run_id;
CREATE INDEX IF NOT EXISTS idx_incidents_run_id          ON incidents(run_id);
DROP INDEX IF EXISTS idx_incidents_category;
CREATE INDEX IF NOT EXISTS idx_incidents_category        ON incidents(category);
DROP INDEX IF EXISTS idx_incidents_severity;
CREATE INDEX IF NOT EXISTS idx_incidents_severity        ON incidents(severity);
DROP INDEX IF EXISTS idx_incidents_created_at;
CREATE INDEX IF NOT EXISTS idx_incidents_created_at      ON incidents(created_at);
DROP INDEX IF EXISTS idx_incidents_project_created;
CREATE INDEX IF NOT EXISTS idx_incidents_project_created ON incidents(project_name, created_at);