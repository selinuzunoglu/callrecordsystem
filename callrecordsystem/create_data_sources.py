import psycopg2
from psycopg2.extras import RealDictCursor
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

def get_database_connection():
    """Database bağlantısı oluştur"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Database bağlantı hatası: {e}")
        return None

def create_pbx():
    """PBX oluştur"""
    conn = get_database_connection()
    if not conn:
        return None
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # PBX var mı kontrol et
            cursor.execute("SELECT id FROM pbxes WHERE name = 'KAREL PBX'")
            existing_pbx = cursor.fetchone()
            
            if existing_pbx:
                logger.info(f"Mevcut PBX ID: {existing_pbx['id']}")
                return existing_pbx['id']
            
            # Yeni PBX oluştur
            cursor.execute("""
                INSERT INTO pbxes (name, created_by, created_at)
                VALUES (%s, %s, NOW())
                RETURNING id
            """, ('KAREL PBX', 'admin'))
            
            pbx_id = cursor.fetchone()['id']
            conn.commit()
            logger.info(f"Yeni PBX oluşturuldu, ID: {pbx_id}")
            return pbx_id
            
    except Exception as e:
        logger.error(f"PBX oluşturma hatası: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()

def create_data_sources(pbx_id):
    """Data source'ları oluştur"""
    conn = get_database_connection()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cursor:
            # Mevcut data source'ları kontrol et
            cursor.execute("SELECT COUNT(*) FROM data_source WHERE deleted_at IS NULL")
            existing_count = cursor.fetchone()[0]
            
            if existing_count > 0:
                logger.info(f"Zaten {existing_count} data source mevcut, yeni data source'lar ekleniyor...")
            
            # 20 farklı data source oluştur
            data_sources = [
                ('KAREL TAFICS 1', '192.168.1.101'),
                ('KAREL SIP 1', '192.168.1.102'),
                ('KAREL ANALOG 1', '192.168.1.103'),
                ('KAREL NUMERIC 1', '192.168.1.104'),
                ('KAREL NETWORK 1', '192.168.1.105'),
                ('KAREL TAFICS 2', '192.168.1.106'),
                ('KAREL SIP 2', '192.168.1.107'),
                ('KAREL ANALOG 2', '192.168.1.108'),
                ('KAREL NUMERIC 2', '192.168.1.109'),
                ('KAREL NETWORK 2', '192.168.1.110'),
                ('KAREL TAFICS 3', '192.168.1.111'),
                ('KAREL SIP 3', '192.168.1.112'),
                ('KAREL ANALOG 3', '192.168.1.113'),
                ('KAREL NUMERIC 3', '192.168.1.114'),
                ('KAREL NETWORK 3', '192.168.1.115'),
                ('KAREL TAFICS 4', '192.168.1.116'),
                ('KAREL SIP 4', '192.168.1.117'),
                ('KAREL ANALOG 4', '192.168.1.118'),
                ('KAREL NUMERIC 4', '192.168.1.119'),
                ('KAREL NETWORK 4', '192.168.1.120')
            ]
            
            for name, ip in data_sources:
                cursor.execute("""
                    INSERT INTO data_source (pbx_id, name, ip, created_by, created_at)
                    VALUES (%s, %s, %s, %s, NOW())
                """, (pbx_id, name, ip, 'admin'))
            
            conn.commit()
            logger.info(f"{len(data_sources)} data source oluşturuldu")
            return True
            
    except Exception as e:
        logger.error(f"Data source oluşturma hatası: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def main():
    """Ana fonksiyon"""
    logger.info("Data source oluşturma başlıyor...")
    
    # PBX oluştur
    pbx_id = create_pbx()
    if not pbx_id:
        logger.error("PBX oluşturulamadı!")
        return
    
    # Data source'ları oluştur
    if create_data_sources(pbx_id):
        logger.info("Data source'lar başarıyla oluşturuldu!")
    else:
        logger.error("Data source oluşturma başarısız!")

if __name__ == "__main__":
    main() 