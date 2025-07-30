-- pbxes tablosu
CREATE TABLE pbxes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP,
    updated_by VARCHAR(50),
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(50)
);

-- data_source tablosu
CREATE TABLE data_source (
    id SERIAL PRIMARY KEY,
    pbx_id INTEGER REFERENCES pbxes(id),
    name VARCHAR(100) NOT NULL,
    ip VARCHAR(50),
    created_by VARCHAR(50),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(50)
);

-- call_logs tablosu
CREATE TABLE call_logs (
    id SERIAL PRIMARY KEY,
    call_id INTEGER REFERENCES call_logs(id), -- self-referans, bir çağrının ana çağrısı
    transfer_from VARCHAR(50),
    trasferred_to VARCHAR(50),
    source_id INTEGER REFERENCES data_source(id),
    caller_phone_nr VARCHAR(50),
    called_phone_nr VARCHAR(50),
    call_type VARCHAR(50),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration INTEGER,
    audio_recording_file VARCHAR(255)
);

-- SoftDelete: Silme işlemi yapılmaz, sadece deleted_at ve deleted_by güncellenir.