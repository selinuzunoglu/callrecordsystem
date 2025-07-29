DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='call_logs' AND column_name='deleted_at') THEN
        ALTER TABLE call_logs ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='call_logs' AND column_name='deleted_by') THEN
        ALTER TABLE call_logs ADD COLUMN deleted_by VARCHAR(255);
    END IF;
END$$; 