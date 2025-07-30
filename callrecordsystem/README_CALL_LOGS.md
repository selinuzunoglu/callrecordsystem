# 70 Milyon Çağrı Kaydı Oluşturma Scripti

Bu script, KAREL Call Record System için 70 milyon çağrı kaydı oluşturur.

## Özellikler

- **70 milyon çağrı kaydı** oluşturur
- **Gerçekçi Türkiye telefon numaraları** kullanır
- **Farklı çağrı tipleri**: TAFICS, SIP, ANALOG, NUMERIC, NETWORK
- **Transfer bilgileri**: SUBSCRIBER, GSM, INTERNAL, EXTERNAL
- **Paralel işleme** ile hızlı veri oluşturma
- **Progress tracking** ve ETA hesaplama

## Kurulum

1. **Python kütüphanelerini yükle:**
```bash
pip install -r requirements.txt
```

2. **Database bağlantısını kontrol et:**
- PostgreSQL çalışıyor olmalı
- `callrecorddb` veritabanı mevcut olmalı
- Bağlantı bilgileri `generate_call_logs.py` dosyasında doğru olmalı

## Kullanım

### 1. Data Source Oluştur
```bash
python create_data_sources.py
```

### 2. Çağrı Kayıtlarını Oluştur
```bash
python generate_call_logs.py
```

## Veri Yapısı

### CallLog Tablosu
- `transfer_from`: Transfer kaynağı (SUB_1234, GSM numara, vb.)
- `trasferred_to`: Transfer hedefi
- `source_id`: Data source ID (rastgele)
- `caller_phone_nr`: Arayan numara (Türkiye formatında)
- `called_phone_nr`: Aranan numara
- `call_type`: TAFICS, SIP, ANALOG, NUMERIC, NETWORK
- `started_at`: Çağrı başlangıç zamanı
- `ended_at`: Çağrı bitiş zamanı
- `duration`: Süre (saniye)
- `audio_recording_file`: Ses kaydı dosya adı

### Çağrı Süreleri Dağılımı
- **%60**: Kısa çağrılar (5-60 saniye)
- **%30**: Orta çağrılar (1-10 dakika)
- **%10**: Uzun çağrılar (10-60 dakika)

### Tarih Aralığı
- **Başlangıç**: 1 Ocak 2024
- **Bitiş**: 28 Temmuz 2025

## Performans

- **Batch size**: 1,000 kayıt
- **Paralel worker**: 4 thread
- **Tahmini süre**: 2-4 saat
- **Hız**: ~5,000-10,000 kayıt/saniye

## Güvenlik

- Script çalıştırmadan önce onay ister
- Mevcut verileri silmez
- Hata durumunda rollback yapar

## Monitoring

Script çalışırken:
- Her 100 batch'te progress gösterir
- Hız ve ETA hesaplar
- Hata durumlarını loglar

## Örnek Çıktı

```
2025-07-28 11:30:00 - INFO - 70 milyon çağrı kaydı oluşturuluyor...
2025-07-28 11:30:00 - INFO - Batch size: 1000, Workers: 4
2025-07-28 11:30:05 - INFO - Progress: 100,000/70,000,000 (0.14%) Speed: 5000 records/sec ETA: 3.9 hours
2025-07-28 11:30:10 - INFO - Progress: 200,000/70,000,000 (0.29%) Speed: 5200 records/sec ETA: 3.7 hours
...
```

## Sorun Giderme

### Database Bağlantı Hatası
- PostgreSQL servisinin çalıştığından emin olun
- Bağlantı bilgilerini kontrol edin

### Data Source Bulunamadı
- Önce `create_data_sources.py` çalıştırın
- PBX ve data source'ların oluşturulduğunu kontrol edin

### Yavaş Performans
- Batch size'ı azaltın (500)
- Worker sayısını azaltın (2)
- Database indekslerini kontrol edin 