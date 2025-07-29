ALTER TABLE data_source ADD COLUMN IF NOT EXISTS created_at timestamp;
ALTER TABLE data_source ADD COLUMN IF NOT EXISTS updated_at timestamp;
ALTER TABLE data_source ADD COLUMN IF NOT EXISTS deleted_at timestamp; 