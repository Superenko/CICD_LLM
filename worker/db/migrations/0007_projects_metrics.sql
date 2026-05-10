-- Migration 0007: Add analytics metrics to projects table
-- Adds denormalized run counters so the dashboard can display success rates
-- without expensive aggregation queries on every page load.
-- Values are kept in sync by github.service.ts on each workflow run save.

ALTER TABLE projects ADD COLUMN total_runs   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN failed_runs  INTEGER NOT NULL DEFAULT 0;

-- Backfill counts from workflow_runs if that table already has data
UPDATE projects
SET
  total_runs  = (
    SELECT COUNT(*) FROM workflow_runs wr
    WHERE wr.project_name = projects.name
      AND wr.conclusion IS NOT NULL
  ),
  failed_runs = (
    SELECT COUNT(*) FROM workflow_runs wr
    WHERE wr.project_name = projects.name
      AND wr.conclusion = 'failure'
  );

CREATE INDEX IF NOT EXISTS idx_projects_failed_runs ON projects(failed_runs);
