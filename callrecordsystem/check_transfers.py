import psycopg2
from psycopg2.extras import RealDictCursor

def check_transfer_data():
    conn = psycopg2.connect(
        host='localhost',
        database='callrecorddb',
        user='postgres',
        password='ankara123'
    )
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    print("=== TRANSFER VERİLERİNİ KONTROL EDİYORUM ===")
    
    # Transfer_from değerleri olan kayıtları kontrol et
    cur.execute("""
        SELECT 
            id,
            transfer_from,
            trasferred_to,
            caller_phone_nr,
            called_phone_nr,
            call_type,
            started_at
        FROM call_logs 
        WHERE transfer_from IS NOT NULL 
        ORDER BY id 
        LIMIT 10
    """)
    
    transfer_records = cur.fetchall()
    print(f"\nTransfer_from değeri olan kayıtlar ({len(transfer_records)} adet):")
    for record in transfer_records:
        print(f"ID: {record['id']}, Transfer From: {record['transfer_from']}, Transfer To: {record['trasferred_to']}")
    
    # Transfer_from NULL olan kayıtları kontrol et
    cur.execute("""
        SELECT 
            id,
            transfer_from,
            trasferred_to,
            caller_phone_nr,
            called_phone_nr,
            call_type,
            started_at
        FROM call_logs 
        WHERE transfer_from IS NULL 
        ORDER BY id 
        LIMIT 10
    """)
    
    null_records = cur.fetchall()
    print(f"\nTransfer_from NULL olan kayıtlar ({len(null_records)} adet):")
    for record in null_records:
        print(f"ID: {record['id']}, Transfer From: {record['transfer_from']}, Transfer To: {record['trasferred_to']}")
    
    # İstatistikler
    cur.execute("""
        SELECT 
            COUNT(*) as total_records,
            COUNT(transfer_from) as transfer_from_count,
            COUNT(trasferred_to) as transferred_to_count,
            COUNT(CASE WHEN transfer_from IS NOT NULL THEN 1 END) as non_null_transfer_from,
            COUNT(CASE WHEN trasferred_to IS NOT NULL THEN 1 END) as non_null_transferred_to
        FROM call_logs
    """)
    
    stats = cur.fetchone()
    print(f"\n=== İSTATİSTİKLER ===")
    print(f"Toplam kayıt: {stats['total_records']:,}")
    print(f"Transfer_from NULL olmayan: {stats['non_null_transfer_from']:,}")
    print(f"Transfer_from NULL olan: {stats['total_records'] - stats['non_null_transfer_from']:,}")
    print(f"Transfer_to NULL olmayan: {stats['non_null_transferred_to']:,}")
    print(f"Transfer_to NULL olan: {stats['total_records'] - stats['non_null_transferred_to']:,}")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    check_transfer_data() 