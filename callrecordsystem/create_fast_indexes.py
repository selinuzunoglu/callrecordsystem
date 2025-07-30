import psycopg2
import time

def create_fast_search_indexes():
    conn = psycopg2.connect(
        host='localhost',
        database='callrecorddb',
        user='postgres',
        password='ankara123'
    )
    cur = conn.cursor()
    
    print("HIZLI ARAMA İÇİN ÖZEL INDEX'LER OLUŞTURULUYOR...")
    
    # Hızlı arama için özel index'ler
    fast_indexes = [
        "-- 1. Telefon numaraları için tam eşleşme index'i",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_caller_phone_exact ON call_logs(caller_phone_nr) WHERE caller_phone_nr IS NOT NULL;",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_called_phone_exact ON call_logs(called_phone_nr) WHERE called_phone_nr IS NOT NULL;",
        
        "-- 2. ID araması için index (en hızlı)",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_id_search ON call_logs(id);",
        
        "-- 3. Çağrı tipi için index",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_call_type_exact ON call_logs(call_type) WHERE call_type IS NOT NULL;",
        
        "-- 4. Transfer bilgileri için index",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_transfer_from_exact ON call_logs(transfer_from) WHERE transfer_from IS NOT NULL;",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_transferred_to_exact ON call_logs(trasferred_to) WHERE trasferred_to IS NOT NULL;",
        
        "-- 5. Composite index'ler (birden fazla alan için hızlı arama)",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_phone_composite ON call_logs(caller_phone_nr, called_phone_nr);",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_type_date_composite ON call_logs(call_type, started_at);",
        
        "-- 6. Santral adı için index",
        "CREATE INDEX IF NOT EXISTS idx_pbx_name_search ON pbxes(name) WHERE name IS NOT NULL;",
        
        "-- 7. Tarih aralığı için index",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_started_at_range ON call_logs(started_at);",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_ended_at_range ON call_logs(ended_at);",
        
        "-- 8. Duration için index (süre araması için)",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_duration ON call_logs(duration) WHERE duration IS NOT NULL;"
    ]
    
    for i, sql in enumerate(fast_indexes):
        if sql.startswith('--'):
            print(f"\n{sql}")
            continue
            
        try:
            print(f"Hızlı index {i+1}/8 oluşturuluyor...")
            cur.execute(sql)
            conn.commit()
            print(f"✅ Hızlı index başarıyla oluşturuldu")
        except Exception as e:
            print(f"❌ Hızlı index oluşturulurken hata: {e}")
    
    # Index'lerin durumunu kontrol et
    print("\n" + "="*50)
    print("OLUŞTURULAN HIZLI INDEX'LER:")
    print("="*50)
    
    cur.execute("""
        SELECT 
            schemaname,
            tablename,
            indexname,
            indexdef
        FROM pg_indexes 
        WHERE tablename IN ('call_logs', 'data_source', 'pbxes')
        AND indexname LIKE '%fast%' OR indexname LIKE '%exact%' OR indexname LIKE '%search%'
        ORDER BY tablename, indexname;
    """)
    
    indexes_info = cur.fetchall()
    for info in indexes_info:
        print(f"📋 {info[2]} -> {info[1]}")
    
    print(f"\n✅ Toplam {len(indexes_info)} hızlı index oluşturuldu!")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    create_fast_search_indexes() 