ALTER TABLE incidents ADD COLUMN severity VARCHAR(20);
ALTER TABLE incidents ADD COLUMN root_cause TEXT;
ALTER TABLE incidents ADD COLUMN actionable_commands TEXT;
