ALTER TABLE data_source ADD COLUMN IF NOT EXISTS updated_by varchar(50);
ALTER TABLE data_source ADD COLUMN IF NOT EXISTS deleted_by varchar(50); 