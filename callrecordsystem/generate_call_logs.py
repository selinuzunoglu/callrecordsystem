import random
import json
import time
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import threading
from concurrent.futures import ThreadPoolExecutor
import logging

# Logging ayarları
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Database bağlantı bilgileri
DB_CONFIG = {
    'host': 'localhost',
    'database': 'callrecorddb',
    'user': 'postgres',
    'password': 'ankara123',
    'port': 5432
}

# Sabit değerler
CALL_TYPES = ['TAFICS', 'SIP', 'ANALOG', 'NUMERIC', 'NETWORK']

# Türkiye telefon numaraları için prefix'ler
TURKEY_PREFIXES = [
    '0212', '0216', '0224', '0232', '0242', '0258', '0262', '0274', '0282', '0292',
    '0312', '0322', '0332', '0342', '0352', '0362', '0372', '0382', '0392',
    '0412', '0422', '0432', '0442', '0452', '0462', '0472', '0482', '0492',
    '0501', '0502', '0503', '0504', '0505', '0506', '0507', '0508', '0509',
    '0531', '0532', '0533', '0534', '0535', '0536', '0537', '0538', '0539',
    '0541', '0542', '0543', '0544', '0545', '0546', '0547', '0548', '0549',
    '0551', '0552', '0553', '0554', '0555', '0556', '0557', '0558', '0559'
]

def get_database_connection():
    """Database bağlantısı oluştur"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Database bağlantı hatası: {e}")
        return None

def get_data_sources():
    """Mevcut data source'ları getir"""
    conn = get_database_connection()
    if not conn:
        return []
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id FROM data_source WHERE deleted_at IS NULL")
            sources = cursor.fetchall()
            return [source['id'] for source in sources]
    except Exception as e:
        logger.error(f"Data source getirme hatası: {e}")
        return []
    finally:
        conn.close()

def generate_phone_number():
    """Rastgele Türkiye telefon numarası oluştur"""
    prefix = random.choice(TURKEY_PREFIXES)
    if prefix.startswith('0'):
        # Sabit hat
        number = ''.join([str(random.randint(0, 9)) for _ in range(7)])
    else:
        # Mobil
        number = ''.join([str(random.randint(0, 9)) for _ in range(7)])
    
    return f"{prefix} {number[:3]} {number[3:5]} {number[5:]}"



def generate_call_duration():
    """Çağrı süresi oluştur (saniye cinsinden)"""
    # %60 kısa çağrılar (0-60 saniye)
    # %30 orta çağrılar (1-10 dakika)
    # %10 uzun çağrılar (10-60 dakika)
    rand = random.random()
    
    if rand < 0.6:
        return random.randint(5, 60)
    elif rand < 0.9:
        return random.randint(60, 600)
    else:
        return random.randint(600, 3600)

def generate_call_log_batch(batch_size=1000, start_date=None, end_date=None):
    """Bir batch çağrı kaydı oluştur"""
    if not start_date:
        start_date = datetime(2024, 1, 1)
    if not end_date:
        end_date = datetime(2025, 7, 28)
    
    data_sources = get_data_sources()
    if not data_sources:
        logger.warning("Data source bulunamadı, varsayılan ID kullanılıyor")
        data_sources = [1]
    
    batch_data = []
    
    for _ in range(batch_size):
        # Ana çağrı mı transfer çağrısı mı karar ver
        is_transfer = random.random() < 0.3  # %30 transfer çağrısı
        
        # Rastgele tarih oluştur
        call_start = start_date + timedelta(
            seconds=random.randint(0, int((end_date - start_date).total_seconds()))
        )
        
        # Çağrı süresi
        duration = generate_call_duration()
        call_end = call_start + timedelta(seconds=duration)
        
        # Transfer bilgileri (ID referansları) - basit versiyon
        transfer_from = None
        trasferred_to = None
        
        # Çağrı kaydı oluştur
        call_log = {
            'call_id': None,  # Varsayılan olarak null
            'transfer_from': transfer_from,
            'trasferred_to': trasferred_to,  
            'source_id': random.choice(data_sources),
            'caller_phone_nr': generate_phone_number(),
            'called_phone_nr': generate_phone_number(),
            'call_type': random.choice(CALL_TYPES),
            'started_at': call_start.isoformat(),
            'ended_at': call_end.isoformat(),
            'duration': duration,
            'audio_recording_file': f"recording_{random.randint(1000000, 9999999)}.wav"
        }
        
        batch_data.append(call_log)
    
    return batch_data

def insert_batch_to_database(batch_data):
    """Batch veriyi database'e ekle ve dönen ID'leri al"""
    conn = get_database_connection()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cursor:
            # Her kayıt için ayrı insert yap (RETURNING için)
            inserted_ids = []
            
            for call in batch_data:
                insert_sql = """
                INSERT INTO call_logs 
                (call_id, transfer_from, trasferred_to, source_id, caller_phone_nr, called_phone_nr, 
                 call_type, started_at, ended_at, duration, audio_recording_file)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """
                
                values = (
                    call['call_id'],
                    call['transfer_from'],
                    call['trasferred_to'],
                    call['source_id'],
                    call['caller_phone_nr'],
                    call['called_phone_nr'],
                    call['call_type'],
                    call['started_at'],
                    call['ended_at'],
                    call['duration'],
                    call['audio_recording_file']
                )
                
                cursor.execute(insert_sql, values)
                inserted_id = cursor.fetchone()[0]
                inserted_ids.append(inserted_id)
                
                # Call'a ID'yi ekle
                call['id'] = inserted_id
                
                # Eğer transfer çağrısı ise, parent çağrının transferred_to'sunu güncelle
                if call['transfer_from'] is not None:
                    # Parent çağrının transferred_to'sunu bu çağrının ID'si ile güncelle
                    parent_update_sql = "UPDATE call_logs SET trasferred_to = %s WHERE id = %s"
                    cursor.execute(parent_update_sql, (inserted_id, call['transfer_from']))
                
                # call_id'yi kendisinin ID'si ile güncelle
                call_id_update_sql = "UPDATE call_logs SET call_id = %s WHERE id = %s"
                cursor.execute(call_id_update_sql, (inserted_id, inserted_id))
            
            conn.commit()
            return True
            
    except Exception as e:
        logger.error(f"Database insert hatası: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def generate_call_logs_with_transfers(total_records=70000000, batch_size=1000, max_workers=4):
    """Ana fonksiyon: 70 milyon çağrı kaydı oluştur (sınırsız transfer zincirleri ile)"""
    logger.info(f"70 milyon çağrı kaydı oluşturuluyor (sınırsız transfer zincirleri ile)...")
    logger.info(f"Batch size: {batch_size}, Workers: {max_workers}")
    
    # Ana çağrıları oluştur (%30)
    main_calls_count = int(total_records * 0.3)
    transfer_calls_count = total_records - main_calls_count
    
    # Batch size'ı küçük sayılar için ayarla
    if total_records < 1000:
        # Ana çağrılar için batch size
        main_batch_size = min(batch_size, main_calls_count)
        transfer_batch_size = min(batch_size, transfer_calls_count)
        max_workers = min(max_workers, 2)
    
    logger.info(f"Ana çağrılar: {main_calls_count:,}, Transfer çağrıları: {transfer_calls_count:,}")
    
    # Ana çağrıları oluştur
    main_batch_size = min(batch_size, main_calls_count) if total_records < 1000 else batch_size
    main_calls, main_call_times = generate_main_calls(main_calls_count, main_batch_size, max_workers)
    
    # Sınırsız transfer zincirleri oluştur
    transfer_batch_size = min(batch_size, transfer_calls_count) if total_records < 1000 else batch_size
    transfer_calls = generate_unlimited_transfer_chains(transfer_calls_count, main_calls, main_call_times, transfer_batch_size, max_workers)
    
    logger.info(f"Toplam {len(main_calls) + len(transfer_calls):,} çağrı kaydı oluşturuldu")

def generate_main_calls(total_records, batch_size, max_workers):
    """Ana çağrıları oluştur"""
    logger.info("Ana çağrılar oluşturuluyor...")
    
    all_calls = []  # Tüm çağrı ID'leri (ana + transfer)
    all_call_times = {}  # Tüm çağrı zamanları: {call_id: (started_at, ended_at)}
    total_batches = total_records // batch_size
    completed_records = 0
    
    start_time = time.time()
    
    def process_main_batch(batch_num):
        nonlocal completed_records
        
        try:
            # Ana çağrı batch'i oluştur
            batch_data = generate_main_call_batch(batch_size)
            
            # Database'e ekle
            if insert_batch_to_database(batch_data):
                completed_records += len(batch_data)
                
                # Ana çağrı zamanlarını sakla
                for call in batch_data:
                    call_id = call.get('id')  # Database'den dönen ID
                    if call_id:
                        all_calls.append(call_id)
                        all_call_times[call_id] = (call['started_at'], call['ended_at'])
                
                # Progress log
                if batch_num % 50 == 0:
                    elapsed_time = time.time() - start_time
                    records_per_second = completed_records / elapsed_time
                    remaining_records = total_records - completed_records
                    estimated_time = remaining_records / records_per_second if records_per_second > 0 else 0
                    
                    logger.info(f"Ana çağrılar: {completed_records:,}/{total_records:,} "
                              f"({completed_records/total_records*100:.2f}%) "
                              f"Speed: {records_per_second:.0f} records/sec "
                              f"ETA: {estimated_time/3600:.1f} hours")
                
                return True
            else:
                logger.error(f"Ana çağrı batch {batch_num} insert başarısız")
                return False
                
        except Exception as e:
            logger.error(f"Ana çağrı batch {batch_num} işleme hatası: {e}")
            return False
    
    # ThreadPoolExecutor ile paralel işleme
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = []
        
        for batch_num in range(total_batches):
            future = executor.submit(process_main_batch, batch_num)
            futures.append(future)
        
        # Tüm batch'lerin tamamlanmasını bekle
        for future in futures:
            future.result()
    
    total_time = time.time() - start_time
    logger.info(f"Ana çağrılar tamamlandı! {completed_records:,} kayıt {total_time/3600:.2f} saatte oluşturuldu")
    return all_calls, all_call_times

def generate_main_call_batch(batch_size):
    """Ana çağrı batch'i oluştur"""
    data_sources = get_data_sources()
    if not data_sources:
        data_sources = [1]
    
    batch_data = []
    
    for _ in range(batch_size):
        # Rastgele tarih oluştur
        call_start = datetime(2024, 1, 1) + timedelta(
            seconds=random.randint(0, int((datetime(2025, 7, 28) - datetime(2024, 1, 1)).total_seconds()))
        )
        
        # Çağrı süresi
        duration = generate_call_duration()
        call_end = call_start + timedelta(seconds=duration)
        
        # Ana çağrılar için transfer bilgileri null
        transfer_from = None
        trasferred_to = None
        
        # Ana çağrı kaydı oluştur
        call_log = {
            'call_id': None,  # Ana çağrı olduğu için null
            'transfer_from': transfer_from,
            'trasferred_to': trasferred_to,
            'source_id': random.choice(data_sources),
            'caller_phone_nr': generate_phone_number(),
            'called_phone_nr': generate_phone_number(),
            'call_type': random.choice(CALL_TYPES),
            'started_at': call_start.isoformat(),
            'ended_at': call_end.isoformat(),
            'duration': duration,
            'audio_recording_file': f"recording_{random.randint(1000000, 9999999)}.wav"
        }
        
        batch_data.append(call_log)
    
    return batch_data

def generate_unlimited_transfer_chains(total_records, all_calls, all_call_times, batch_size, max_workers):
    """Sınırsız transfer zincirleri oluştur"""
    logger.info("Sınırsız transfer zincirleri oluşturuluyor...")
    
    transfer_calls = []
    total_batches = total_records // batch_size
    completed_records = 0
    
    start_time = time.time()
    
    def process_transfer_batch(batch_num):
        nonlocal completed_records
        
        try:
            # Transfer çağrı batch'i oluştur (sınırsız zincir)
            batch_data = generate_unlimited_transfer_batch(batch_size, all_calls, all_call_times)
            
            # Database'e ekle
            if insert_batch_to_database(batch_data):
                completed_records += len(batch_data)
                
                # Yeni transfer çağrılarının zamanlarını sakla
                for call in batch_data:
                    call_id = call.get('id')  # Database'den dönen ID
                    if call_id:
                        transfer_calls.append(call_id)
                        all_calls.append(call_id)  # Tüm çağrılara ekle
                        all_call_times[call_id] = (call['started_at'], call['ended_at'])
                
                # Progress log
                if batch_num % 50 == 0:
                    elapsed_time = time.time() - start_time
                    records_per_second = completed_records / elapsed_time
                    remaining_records = total_records - completed_records
                    estimated_time = remaining_records / records_per_second if records_per_second > 0 else 0
                    
                    logger.info(f"Transfer zincirleri: {completed_records:,}/{total_records:,} "
                              f"({completed_records/total_records*100:.2f}%) "
                              f"Speed: {records_per_second:.0f} records/sec "
                              f"ETA: {estimated_time/3600:.1f} hours")
                
                return True
            else:
                logger.error(f"Transfer batch {batch_num} insert başarısız")
                return False
                
        except Exception as e:
            logger.error(f"Transfer batch {batch_num} işleme hatası: {e}")
            return False
    
    # ThreadPoolExecutor ile paralel işleme
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = []
        
        for batch_num in range(total_batches):
            future = executor.submit(process_transfer_batch, batch_num)
            futures.append(future)
        
        # Tüm batch'lerin tamamlanmasını bekle
        for future in futures:
            future.result()
    
    total_time = time.time() - start_time
    logger.info(f"Transfer zincirleri tamamlandı! {completed_records:,} kayıt {total_time/3600:.2f} saatte oluşturuldu")
    return transfer_calls



def generate_unlimited_transfer_batch(batch_size, all_calls, all_call_times):
    """Sınırsız transfer zinciri batch'i oluştur - karışık ve uzun zincirler"""
    data_sources = get_data_sources()
    if not data_sources:
        data_sources = [1]
    
    batch_data = []
    
    for _ in range(batch_size):
        # Mevcut tüm çağrılardan rastgele seç (ana çağrı veya transfer çağrısı)
        # %95 ihtimalle transfer çağrılarından seç (çok daha uzun zincirler için)
        if all_calls and random.random() < 0.95:
            # Transfer çağrılarından seç (daha uzun zincirler)
            available_calls = [call_id for call_id in all_calls if call_id in all_call_times]
            if available_calls:
                parent_call_id = random.choice(available_calls)
            else:
                parent_call_id = random.choice(all_calls) if all_calls else None
        else:
            # Ana çağrılardan seç (yeni zincir başlat)
            parent_call_id = random.choice(all_calls) if all_calls else None
        
        if parent_call_id and parent_call_id in all_call_times:
            # Parent çağrının gerçek zamanını kullan
            parent_call_start_str, parent_call_end_str = all_call_times[parent_call_id]
            parent_call_start = datetime.fromisoformat(parent_call_start_str)
            parent_call_end = datetime.fromisoformat(parent_call_end_str)
            
            # Transfer çağrısı parent çağrıdan 1-30 saniye sonra başlar
            transfer_delay = random.randint(1, 30)
            call_start = parent_call_end + timedelta(seconds=transfer_delay)
            
            # Transfer çağrısı süresi (genelde daha kısa)
            duration = random.randint(5, 300)  # 5 saniye - 5 dakika
            call_end = call_start + timedelta(seconds=duration)
        else:
            # Fallback: rastgele zaman
            call_start = datetime(2024, 1, 1) + timedelta(
                seconds=random.randint(0, int((datetime(2025, 7, 28) - datetime(2024, 1, 1)).total_seconds()))
            )
            duration = random.randint(5, 300)
            call_end = call_start + timedelta(seconds=duration)
        
        # Transfer çağrıları için transfer bilgileri (ID referansları)
        transfer_from = parent_call_id  # Nereden geldiği (parent çağrı)
        # transferred_to = kendisinin ID'si (transfer zincirini takip etmek için)
        # Bu değer database'den dönen ID ile güncellenecek
        trasferred_to = None  # Şimdilik NULL, insert sonrası güncellenir
        
        # %20 ihtimalle aynı parent'tan birden fazla transfer çağrısı oluştur (çatallanma)
        if random.random() < 0.2 and parent_call_id:
            # Aynı parent'tan ikinci bir transfer çağrısı oluştur
            second_transfer_call = {
                'call_id': None,
                'transfer_from': parent_call_id,
                'trasferred_to': None,
                'source_id': random.choice(data_sources),
                'caller_phone_nr': generate_phone_number(),
                'called_phone_nr': generate_phone_number(),
                'call_type': random.choice(CALL_TYPES),
                'started_at': call_start.isoformat(),  # Aynı zamanda başlar
                'ended_at': call_end.isoformat(),
                'duration': duration,
                'audio_recording_file': f"recording_{random.randint(1000000, 9999999)}.wav"
            }
            batch_data.append(second_transfer_call)
        
        # Transfer çağrı kaydı oluştur
        call_log = {
            'call_id': None,  # Database'den dönen ID ile güncellenecek
            'transfer_from': transfer_from,  # Nereden geldiği (parent çağrı)
            'trasferred_to': trasferred_to,  # Nereye gittiği (kendisinin ID'si olacak)
            'source_id': random.choice(data_sources),
            'caller_phone_nr': generate_phone_number(),
            'called_phone_nr': generate_phone_number(),
            'call_type': random.choice(CALL_TYPES),
            'started_at': call_start.isoformat(),
            'ended_at': call_end.isoformat(),
            'duration': duration,
            'audio_recording_file': f"recording_{random.randint(1000000, 9999999)}.wav"
        }
        
        batch_data.append(call_log)
    
    return batch_data

def generate_call_logs(total_records=70000000, batch_size=1000, max_workers=4):
    """Ana fonksiyon: 70 milyon çağrı kaydı oluştur"""
    logger.info(f"70 milyon çağrı kaydı oluşturuluyor...")
    logger.info(f"Batch size: {batch_size}, Workers: {max_workers}")
    
    total_batches = total_records // batch_size
    completed_records = 0
    
    start_time = time.time()
    
    def process_batch(batch_num):
        nonlocal completed_records
        
        try:
            # Batch veriyi oluştur
            batch_data = generate_call_log_batch(batch_size)
            
            # Database'e ekle
            if insert_batch_to_database(batch_data):
                completed_records += len(batch_data)
                
                # Progress log
                if batch_num % 100 == 0:
                    elapsed_time = time.time() - start_time
                    records_per_second = completed_records / elapsed_time
                    remaining_records = total_records - completed_records
                    estimated_time = remaining_records / records_per_second if records_per_second > 0 else 0
                    
                    logger.info(f"Progress: {completed_records:,}/{total_records:,} "
                              f"({completed_records/total_records*100:.2f}%) "
                              f"Speed: {records_per_second:.0f} records/sec "
                              f"ETA: {estimated_time/3600:.1f} hours")
                
                return True
            else:
                logger.error(f"Batch {batch_num} insert başarısız")
                return False
                
        except Exception as e:
            logger.error(f"Batch {batch_num} işleme hatası: {e}")
            return False
    
    # ThreadPoolExecutor ile paralel işleme
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = []
        
        for batch_num in range(total_batches):
            future = executor.submit(process_batch, batch_num)
            futures.append(future)
        
        # Tüm batch'lerin tamamlanmasını bekle
        for future in futures:
            future.result()
    
    total_time = time.time() - start_time
    logger.info(f"Tamamlandı! {completed_records:,} kayıt {total_time/3600:.2f} saatte oluşturuldu")
    logger.info(f"Ortalama hız: {completed_records/total_time:.0f} kayıt/saniye")

if __name__ == "__main__":
    # Önce data source'ları kontrol et
    sources = get_data_sources()
    if not sources:
        logger.error("Hiç data source bulunamadı! Önce data source oluşturun.")
        exit(1)
    
    logger.info(f"Bulunan data source sayısı: {len(sources)}")
    
    # 70 milyon kayıt oluştur
    print("\n" + "="*60)
    print("70 MİLYON ÇAĞRI KAYDI OLUŞTURMA")
    print("="*60)
    print(f"Toplam kayıt: 70,000,000")
    print(f"Batch size: 5000")
    print(f"Paralel worker: 8")
    print("="*60)
    
    # Çağrı kayıtlarını oluştur (transfer zincirleri ile)
    generate_call_logs_with_transfers(total_records=70000000, batch_size=5000, max_workers=8) 