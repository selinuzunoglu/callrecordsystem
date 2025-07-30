-- SANTRAL VE ÇAĞRI İZİNLERİNİ EKLE
DO $$
BEGIN
    -- Santral izinlerini ekle
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'santral_view') THEN
        INSERT INTO permissions (code, name, description) VALUES ('santral_view', 'Santralleri Görüntüle', 'Santralleri ve veri kaynaklarını görüntüleyebilir');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'santral_edit') THEN
        INSERT INTO permissions (code, name, description) VALUES ('santral_edit', 'Santralleri Düzenle', 'Santralleri ve veri kaynaklarını düzenleyebilir, silebilir');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'call_view') THEN
        INSERT INTO permissions (code, name, description) VALUES ('call_view', 'Çağrı Kayıtlarını Görüntüle', 'Çağrı kayıtlarını görüntüleyebilir ve filtreleyebilir');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'call_edit') THEN
        INSERT INTO permissions (code, name, description) VALUES ('call_edit', 'Çağrı Kayıtlarını Düzenle', 'Çağrı kayıtlarını düzenleyebilir ve silebilir');
    END IF;
END $$;

-- ADMIN ROLÜNE İZİNLERİ ATA
DO $$
DECLARE
    perm_id INTEGER;
BEGIN
    -- Santral görüntüleme
    SELECT id INTO perm_id FROM permissions WHERE code = 'santral_view';
    IF perm_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM role_permission WHERE role_id = 1 AND permission_id = perm_id) THEN
        INSERT INTO role_permission (role_id, permission_id) VALUES (1, perm_id);
    END IF;
    
    -- Santral düzenleme
    SELECT id INTO perm_id FROM permissions WHERE code = 'santral_edit';
    IF perm_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM role_permission WHERE role_id = 1 AND permission_id = perm_id) THEN
        INSERT INTO role_permission (role_id, permission_id) VALUES (1, perm_id);
    END IF;
    
    -- Çağrı görüntüleme
    SELECT id INTO perm_id FROM permissions WHERE code = 'call_view';
    IF perm_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM role_permission WHERE role_id = 1 AND permission_id = perm_id) THEN
        INSERT INTO role_permission (role_id, permission_id) VALUES (1, perm_id);
    END IF;
    
    -- Çağrı düzenleme
    SELECT id INTO perm_id FROM permissions WHERE code = 'call_edit';
    IF perm_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM role_permission WHERE role_id = 1 AND permission_id = perm_id) THEN
        INSERT INTO role_permission (role_id, permission_id) VALUES (1, perm_id);
    END IF;
END $$;

-- USER ROLÜNE İZİNLERİ ATA
DO $$
DECLARE
    perm_id INTEGER;
BEGIN
    -- Santral görüntüleme
    SELECT id INTO perm_id FROM permissions WHERE code = 'santral_view';
    IF perm_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM role_permission WHERE role_id = 2 AND permission_id = perm_id) THEN
        INSERT INTO role_permission (role_id, permission_id) VALUES (2, perm_id);
    END IF;
    
    -- Çağrı görüntüleme
    SELECT id INTO perm_id FROM permissions WHERE code = 'call_view';
    IF perm_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM role_permission WHERE role_id = 2 AND permission_id = perm_id) THEN
        INSERT INTO role_permission (role_id, permission_id) VALUES (2, perm_id);
    END IF;
END $$; 