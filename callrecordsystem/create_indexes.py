import psycopg2
import time

def create_indexes():
    conn = psycopg2.connect(
        host='localhost',
        database='callrecorddb',
        user='postgres',
        password='ankara123'
    )
    cur = conn.cursor()
    
    print("70 Milyon kayıt için performans index'leri oluşturuluyor...")
    
    # Çok hızlı index'ler oluştur
    indexes = [
        "-- 1. Telefon numaraları için çok hızlı index",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_caller_phone_fast ON call_logs(caller_phone_nr) WHERE caller_phone_nr IS NOT NULL;",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_called_phone_fast ON call_logs(called_phone_nr) WHERE called_phone_nr IS NOT NULL;",
        
        "-- 2. ID için en hızlı index",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_id_fast ON call_logs(id);",
        
        "-- 3. Çağrı tipi için hızlı index",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_call_type_fast ON call_logs(call_type) WHERE call_type IS NOT NULL;",
        
        "-- 4. Composite index'ler (çok hızlı)",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_phone_composite ON call_logs(caller_phone_nr, called_phone_nr, id);",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_type_id ON call_logs(call_type, id);",
        
        "-- 5. Transfer bilgileri için index",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_transfer_from ON call_logs(transfer_from);",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_transferred_to ON call_logs(trasferred_to);",
        
        "-- 6. DataSource ve PBX için index",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_source_id ON call_logs(source_id);",
        "CREATE INDEX IF NOT EXISTS idx_data_source_pbx_id ON data_source(pbx_id);",
        "CREATE INDEX IF NOT EXISTS idx_pbx_name ON pbxes(name);",
        
        "-- 7. Tarih için index",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at);",
        "CREATE INDEX IF NOT EXISTS idx_call_logs_ended_at ON call_logs(ended_at);"
    ]
    
    for i, sql in enumerate(indexes):
        if sql.startswith('--'):
            print(f"\n{sql}")
            continue
            
        try:
            print(f"Index {i+1}/10 oluşturuluyor...")
            cur.execute(sql)
            conn.commit()
            print(f"✅ Index başarıyla oluşturuldu")
        except Exception as e:
            print(f"❌ Index oluşturulurken hata: {e}")
    
    # Index'lerin durumunu kontrol et
    print("\n" + "="*50)
    print("OLUŞTURULAN INDEX'LER:")
    print("="*50)
    
    cur.execute("""
        SELECT 
            schemaname,
            tablename,
            indexname,
            indexdef
        FROM pg_indexes 
        WHERE tablename IN ('call_logs', 'data_source', 'pbxes')
        ORDER BY tablename, indexname;
    """)
    
    indexes_info = cur.fetchall()
    for info in indexes_info:
        print(f"📋 {info[2]} -> {info[1]}")
    
    print(f"\n✅ Toplam {len(indexes_info)} index oluşturuldu!")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    create_indexes() 