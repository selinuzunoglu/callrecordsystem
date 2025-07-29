-- 70 Milyon kayıt için performanslı arama index'leri
-- Bu index'ler arama hızını dramatik olarak artıracak

-- 1. Telefon numaraları için index (en çok aranan alan)
CREATE INDEX IF NOT EXISTS idx_call_logs_caller_phone_nr ON call_logs(caller_phone_nr);
CREATE INDEX IF NOT EXISTS idx_call_logs_called_phone_nr ON call_logs(called_phone_nr);

-- 2. Çağrı tipi için index
CREATE INDEX IF NOT EXISTS idx_call_logs_call_type ON call_logs(call_type);

-- 3. Tarih aralığı için index (başlangıç ve bitiş zamanı)
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_call_logs_ended_at ON call_logs(ended_at);

-- 4. DataSource ve PBX ilişkileri için index
CREATE INDEX IF NOT EXISTS idx_call_logs_source_id ON call_logs(source_id);

-- 5. Transfer bilgileri için index
CREATE INDEX IF NOT EXISTS idx_call_logs_transfer_from ON call_logs(transfer_from);
CREATE INDEX IF NOT EXISTS idx_call_logs_transferred_to ON call_logs(transferred_to);

-- 6. Composite index'ler (birden fazla alan için)
CREATE INDEX IF NOT EXISTS idx_call_logs_phone_search ON call_logs(caller_phone_nr, called_phone_nr);
CREATE INDEX IF NOT EXISTS idx_call_logs_type_date ON call_logs(call_type, started_at);

-- 7. Full-text search için index (santral adı araması için)
CREATE INDEX IF NOT EXISTS idx_call_logs_call_id ON call_logs(call_id);

-- 8. DataSource tablosu için index (santral adı araması)
CREATE INDEX IF NOT EXISTS idx_data_source_pbx_id ON data_source(pbx_id);

-- 9. PBX tablosu için index
CREATE INDEX IF NOT EXISTS idx_pbx_name ON pbx(name);

-- 10. Partial index'ler (NULL olmayan değerler için)
CREATE INDEX IF NOT EXISTS idx_call_logs_transfer_active ON call_logs(transfer_from) WHERE transfer_from IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_call_logs_audio_files ON call_logs(audio_recording_file) WHERE audio_recording_file IS NOT NULL;

-- Index'lerin durumunu kontrol et
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('call_logs', 'data_source', 'pbx')
ORDER BY tablename, indexname; 