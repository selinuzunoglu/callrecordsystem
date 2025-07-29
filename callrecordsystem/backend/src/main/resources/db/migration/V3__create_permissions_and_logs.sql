-- YETKİLER TABLOSU
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

-- ROL-YETKİ TABLOSU
CREATE TABLE role_permission (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id),
    permission_id INTEGER REFERENCES permissions(id)
);

-- KULLANICI-YETKİ TABLOSU
CREATE TABLE user_permission (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    permission_id INTEGER REFERENCES permissions(id),
    disabled BOOLEAN DEFAULT FALSE
);

-- KULLANICI GİRİŞ LOG TABLOSU
CREATE TABLE user_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    logged_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    successful BOOLEAN,
    client_ip VARCHAR(50)
);

-- ÖRNEK YETKİLER
INSERT INTO permissions (code, name, description) VALUES ('user_add', 'Kullanıcı Ekle', 'Kullanıcı ekleyebilir');
INSERT INTO permissions (code, name, description) VALUES ('user_delete', 'Kullanıcı Sil', 'Kullanıcı silebilir');
INSERT INTO permissions (code, name, description) VALUES ('user_view', 'Kullanıcıları Görüntüle', 'Kullanıcı listesini görebilir');

-- admin rolüne tüm yetkileri ata
INSERT INTO role_permission (role_id, permission_id) VALUES (1, 1);
INSERT INTO role_permission (role_id, permission_id) VALUES (1, 2);
INSERT INTO role_permission (role_id, permission_id) VALUES (1, 3);
-- user rolüne sadece kullanıcıları görüntüleme yetkisi ata
INSERT INTO role_permission (role_id, permission_id) VALUES (2, 3); 