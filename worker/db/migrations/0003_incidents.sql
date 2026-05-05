CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name VARCHAR(75) NOT NULL,
  run_id TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  solution TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
