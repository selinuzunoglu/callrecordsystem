-- ROL ve YETKİ TABLOLARI
CREATE TABLE roles (
                       id SERIAL PRIMARY KEY,
                       code VARCHAR(50) NOT NULL UNIQUE,
                       name VARCHAR(100) NOT NULL,
                       description TEXT
);

CREATE TABLE permissions (
                             id SERIAL PRIMARY KEY,
                             code VARCHAR(50) NOT NULL UNIQUE,
                             name VARCHAR(100) NOT NULL,
                             description TEXT
);

-- KULLANICI TABLOSU
CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password TEXT NOT NULL,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       name VARCHAR(50),
                       surname VARCHAR(50),
                       password_reset_token TEXT,
                       reset_valid_until TIMESTAMP,
                       deleted_at TIMESTAMP,
                       deleted_by VARCHAR(50)
);

-- KULLANICI LOG TABLOSU
CREATE TABLE user_logs (
                           id SERIAL PRIMARY KEY,
                           user_id INTEGER NOT NULL REFERENCES users(id),
                           logged_in_at TIMESTAMP NOT NULL,
                           successful BOOLEAN,
                           client_ip VARCHAR(45)
);

-- KULLANICI - ROL
CREATE TABLE user_role (
                           id SERIAL PRIMARY KEY,
                           user_id INTEGER NOT NULL REFERENCES users(id),
                           role_id INTEGER NOT NULL REFERENCES roles(id)
);

-- ROL - YETKİ
CREATE TABLE role_permission (
                                 id SERIAL PRIMARY KEY,
                                 role_id INTEGER NOT NULL REFERENCES roles(id),
                                 permission_id INTEGER NOT NULL REFERENCES permissions(id)
);

-- KULLANICI - YETKİ (OVERRIDE)
CREATE TABLE user_permission (
                                 id SERIAL PRIMARY KEY,
                                 user_id INTEGER NOT NULL REFERENCES users(id),
                                 permission_id INTEGER NOT NULL REFERENCES permissions(id),
                                 disabled BOOLEAN DEFAULT FALSE
);

-- PBX CİHAZLARI
CREATE TABLE pbxes (
                       id SERIAL PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       active BOOLEAN DEFAULT TRUE,
                       created_at TIMESTAMP,
                       created_by VARCHAR(50),
                       updated_at TIMESTAMP,
                       updated_by VARCHAR(50),
                       deleted_at TIMESTAMP,
                       deleted_by VARCHAR(50)
);

-- VERİ KAYNAĞI
CREATE TABLE data_source (
                             id SERIAL PRIMARY KEY,
                             pbx_id INTEGER REFERENCES pbxes(id),
                             name VARCHAR(100),
                             ip VARCHAR(50),
                             created_at TIMESTAMP,
                             created_by VARCHAR(50),
                             updated_at TIMESTAMP,
                             updated_by VARCHAR(50),
                             deleted_at TIMESTAMP,
                             deleted_by VARCHAR(50)
);

-- ÇAĞRI LOG KAYITLARI
CREATE TABLE call_logs (
                           id SERIAL PRIMARY KEY,
                           call_id INTEGER REFERENCES call_logs(id), -- self reference
                           transfer_from VARCHAR(50),
                           transferred_to VARCHAR(50),
                           source_id INTEGER REFERENCES data_source(id),
                           caller_phone_nr VARCHAR(20),
                           called_phone_nr VARCHAR(20),
                           call_type VARCHAR(50),
                           started_at TIMESTAMP,
                           ended_at TIMESTAMP,
                           duration INTEGER,
                           audio_recording_file TEXT
);

-- INDEXLER
CREATE INDEX idx_started_at ON call_logs(started_at);
CREATE INDEX idx_caller_phone_nr ON call_logs(caller_phone_nr);
CREATE INDEX idx_call_id ON call_logs(call_id);
