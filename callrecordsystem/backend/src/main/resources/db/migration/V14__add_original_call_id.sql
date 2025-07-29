-- call_logs tablosuna original_call_id sütunu ekle
ALTER TABLE call_logs ADD COLUMN original_call_id INTEGER REFERENCES call_logs(id);

-- Açıklama: original_call_id, bir çağrının ilk ana çağrısını gösterir
-- Ana çağrılar için: original_call_id = NULL (kendisi orijinal)
-- Transfer çağrıları için: original_call_id = [ilk ana çağrının ID'si] 