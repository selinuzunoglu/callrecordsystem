import psycopg2
from psycopg2.extras import RealDictCursor

# Database bağlantı bilgileri
DB_CONFIG = {
    'host': 'localhost',
    'database': 'callrecorddb',
    'user': 'postgres',
    'password': 'ankara123',
    'port': 5432
}

def get_database_connection():
    """Database bağlantısı oluştur"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Database bağlantı hatası: {e}")
        return None

def check_all_records():
    """Tüm kayıtları kontrol et"""
    conn = get_database_connection()
    if not conn:
        return
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Toplam kayıt sayısı
            cursor.execute("SELECT COUNT(*) as total FROM call_logs")
            total = cursor.fetchone()['total']
            print(f"Toplam kayıt sayısı: {total}")
            
            # İlk 10 kayıt
            print("\nİlk 10 kayıt:")
            print("-" * 80)
            cursor.execute("SELECT id, call_id, transfer_from, trasferred_to, caller_phone_nr, called_phone_nr FROM call_logs ORDER BY id LIMIT 10")
            records = cursor.fetchall()
            for record in records:
                print(f"ID: {record['id']}, Call_ID: {record['call_id']}, From: {record['transfer_from']}, To: {record['trasferred_to']}, Caller: {record['caller_phone_nr']}")
            
            # Son 10 kayıt
            print("\nSon 10 kayıt:")
            print("-" * 80)
            cursor.execute("SELECT id, call_id, transfer_from, trasferred_to, caller_phone_nr, called_phone_nr FROM call_logs ORDER BY id DESC LIMIT 10")
            records = cursor.fetchall()
            for record in records:
                print(f"ID: {record['id']}, Call_ID: {record['call_id']}, From: {record['transfer_from']}, To: {record['trasferred_to']}, Caller: {record['caller_phone_nr']}")
            
            # Transfer zinciri örnekleri
            print("\nTransfer zinciri örnekleri:")
            print("-" * 80)
            cursor.execute("""
                SELECT id, call_id, transfer_from, trasferred_to 
                FROM call_logs 
                WHERE transfer_from IS NOT NULL OR trasferred_to IS NOT NULL 
                ORDER BY id 
                LIMIT 10
            """)
            records = cursor.fetchall()
            for record in records:
                print(f"ID: {record['id']}, Call_ID: {record['call_id']}, From: {record['transfer_from']}, To: {record['trasferred_to']}")
            
    except Exception as e:
        print(f"Sorgu hatası: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_all_records() 