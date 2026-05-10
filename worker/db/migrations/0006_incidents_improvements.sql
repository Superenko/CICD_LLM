-- Migration 0006: Improve incidents table
-- 1. Add UNIQUE constraint on run_id to prevent duplicate LLM analysis records
-- 2. Add new analytical columns: llm_model, confidence_score, raw_log_snippet
-- 3. Add performance indexes for dashboard queries

-- SQLite does not support ADD CONSTRAINT on existing tables.
-- We recreate the table with the UNIQUE constraint via rename pattern.

DROP TABLE IF EXISTS incidents_new;

CREATE TABLE incidents_new (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name        VARCHAR(75) NOT NULL,
  run_id              TEXT        NOT NULL UNIQUE,   -- one LLM analysis per GitHub run
  category            VARCHAR(50) NOT NULL,
  severity            VARCHAR(20),                   -- critical | high | medium | low
  root_cause          TEXT,
  solution            TEXT        NOT NULL,
  actionable_commands TEXT,                          -- JSON array stored as text
  llm_model           VARCHAR(75),                   -- e.g. gemini-2.5-flash-lite
  confidence_score    REAL,                          -- 0.0–1.0 (if model returns it)
  raw_log_snippet     TEXT,                          -- the log fragment that triggered analysis
  created_at          INTEGER     NOT NULL DEFAULT (unixepoch())
);

-- Copy existing data (new columns will be NULL for old rows — expected)
-- Using OR IGNORE to automatically discard any duplicate run_ids that already exist in the database
INSERT OR IGNORE INTO incidents_new
  (id, project_name, run_id, category, severity, root_cause, solution, actionable_commands, created_at)
SELECT
  MAX(id) as id, project_name, run_id, category, severity, root_cause, solution, actionable_commands, created_at
FROM incidents
GROUP BY run_id;

DROP TABLE incidents;
ALTER TABLE incidents_new RENAME TO incidents;

-- Indexes for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_incidents_project_name    ON incidents(project_name);
CREATE INDEX IF NOT EXISTS idx_incidents_run_id          ON incidents(run_id);
CREATE INDEX IF NOT EXISTS idx_incidents_category        ON incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_severity        ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at      ON incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_incidents_project_created ON incidents(project_name, created_at);
