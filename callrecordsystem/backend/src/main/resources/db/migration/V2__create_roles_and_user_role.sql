CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE user_role (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id)
);

INSERT INTO roles (code, name, description) VALUES ('admin', 'Admin', 'Yönetici');
INSERT INTO roles (code, name, description) VALUES ('user', 'User', 'Normal Kullanıcı');
INSERT INTO user_role (user_id, role_id) VALUES (1, 1);