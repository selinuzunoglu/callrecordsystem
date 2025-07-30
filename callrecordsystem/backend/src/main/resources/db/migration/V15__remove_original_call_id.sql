-- Remove original_call_id column from call_logs table
ALTER TABLE call_logs DROP COLUMN IF EXISTS original_call_id; 