-- Test kullanıcısı oluştur
INSERT INTO users (username, password, email, name, surname, status) 
VALUES (
    'admin', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- password: admin123
    'admin@test.com',
    'Admin',
    'User',
    'Aktif'
) ON CONFLICT (username) DO NOTHING;

-- Admin rolü oluştur (eğer yoksa)
INSERT INTO roles (code, name, description) 
VALUES ('admin', 'Yönetici', 'Sistem yöneticisi') 
ON CONFLICT (code) DO NOTHING;

-- Kullanıcıya admin rolü ata
INSERT INTO user_role (user_id, role_id) 
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.username = 'admin' AND r.code = 'admin'
ON CONFLICT DO NOTHING; 