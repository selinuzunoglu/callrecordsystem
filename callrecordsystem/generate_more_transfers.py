import psycopg2
import random
from datetime import datetime, timedelta
from psycopg2.extras import RealDictCursor
import time

def generate_more_transfers():
    """Mevcut kayıtlardan daha fazla transfer verisi oluştur"""
    conn = psycopg2.connect(
        host='localhost',
        database='callrecorddb',
        user='postgres',
        password='ankara123'
    )
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    print("=== DAHA FAZLA TRANSFER VERİSİ OLUŞTURULUYOR ===")
    
    # Mevcut ana çağrıları al (transfer_from NULL olan)
    cur.execute("""
        SELECT id, started_at, ended_at, caller_phone_nr, called_phone_nr, call_type, source_id
        FROM call_logs 
        WHERE transfer_from IS NULL 
        ORDER BY id 
        LIMIT 10000
    """)
    
    main_calls = cur.fetchall()
    print(f"Ana çağrı sayısı: {len(main_calls)}")
    
    if not main_calls:
        print("Ana çağrı bulunamadı!")
        return
    
    # Transfer çağrıları oluştur
    transfer_batch = []
    data_sources = [1, 2, 3]  # Varsayılan data source ID'leri
    
    for i, main_call in enumerate(main_calls):
        # Her ana çağrı için 1-3 transfer çağrısı oluştur
        num_transfers = random.randint(1, 3)
        
        for j in range(num_transfers):
            # Transfer çağrısı ana çağrıdan sonra başlar
            transfer_delay = random.randint(1, 30)  # 1-30 saniye sonra
            transfer_start = main_call['ended_at'] + timedelta(seconds=transfer_delay)
            
            # Transfer süresi (genelde daha kısa)
            transfer_duration = random.randint(5, 300)  # 5 saniye - 5 dakika
            transfer_end = transfer_start + timedelta(seconds=transfer_duration)
            
            # Transfer çağrı kaydı
            transfer_call = {
                'call_id': None,
                'transfer_from': main_call['id'],  # Ana çağrının ID'si
                'trasferred_to': None,  # Şimdilik NULL
                'source_id': random.choice(data_sources),
                'caller_phone_nr': main_call['called_phone_nr'],  # Aynı numara
                'called_phone_nr': f"0532 {random.randint(100, 999)} {random.randint(1000, 9999)}",  # Yeni numara
                'call_type': main_call['call_type'],
                'started_at': transfer_start,
                'ended_at': transfer_end,
                'duration': transfer_duration,
                'audio_recording_file': f"transfer_recording_{random.randint(1000000, 9999999)}.wav"
            }
            
            transfer_batch.append(transfer_call)
            
            # Ana çağrının transferred_to alanını güncelle
            cur.execute("""
                UPDATE call_logs 
                SET trasferred_to = %s 
                WHERE id = %s
            """, (main_call['id'], main_call['id']))
    
    # Transfer çağrılarını veritabanına ekle
    print(f"Transfer çağrı sayısı: {len(transfer_batch)}")
    
    for transfer_call in transfer_batch:
        cur.execute("""
            INSERT INTO call_logs (
                call_id, transfer_from, trasferred_to, source_id, 
                caller_phone_nr, called_phone_nr, call_type, 
                started_at, ended_at, duration, audio_recording_file
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        """, (
            transfer_call['call_id'],
            transfer_call['transfer_from'],
            transfer_call['trasferred_to'],
            transfer_call['source_id'],
            transfer_call['caller_phone_nr'],
            transfer_call['called_phone_nr'],
            transfer_call['call_type'],
            transfer_call['started_at'],
            transfer_call['ended_at'],
            transfer_call['duration'],
            transfer_call['audio_recording_file']
        ))
    
    conn.commit()
    print("✅ Transfer çağrıları başarıyla eklendi!")
    
    # Güncellenmiş istatistikleri göster
    cur.execute("""
        SELECT 
            COUNT(*) as total_records,
            COUNT(CASE WHEN transfer_from IS NOT NULL THEN 1 END) as non_null_transfer_from,
            COUNT(CASE WHEN trasferred_to IS NOT NULL THEN 1 END) as non_null_transferred_to
        FROM call_logs
    """)
    
    stats = cur.fetchone()
    print(f"\n=== GÜNCELLENMİŞ İSTATİSTİKLER ===")
    print(f"Toplam kayıt: {stats['total_records']:,}")
    print(f"Transfer_from NULL olmayan: {stats['non_null_transfer_from']:,}")
    print(f"Transfer_to NULL olmayan: {stats['non_null_transferred_to']:,}")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    generate_more_transfers() 