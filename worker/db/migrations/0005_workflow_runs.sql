-- Migration 0005: Add workflow_runs table
-- Stores every CI/CD pipeline run, independent of whether an incident was generated.
-- This enables trend analysis: how often builds fail, duration stats, etc.

CREATE TABLE IF NOT EXISTS workflow_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name    VARCHAR(75) NOT NULL,
  run_id          TEXT        NOT NULL UNIQUE,
  status          VARCHAR(50),          -- queued | in_progress | completed
  conclusion      VARCHAR(50),          -- success | failure | cancelled | timed_out | skipped
  triggered_by    VARCHAR(50),          -- push | workflow_dispatch | schedule | pull_request
  started_at      INTEGER,              -- unix epoch
  completed_at    INTEGER,              -- unix epoch
  duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN completed_at IS NOT NULL AND started_at IS NOT NULL
      THEN completed_at - started_at
      ELSE NULL
    END
  ) VIRTUAL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_project_name    ON workflow_runs(project_name);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_run_id          ON workflow_runs(run_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_conclusion      ON workflow_runs(conclusion);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_created_at      ON workflow_runs(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_project_created ON workflow_runs(project_name, created_at);
