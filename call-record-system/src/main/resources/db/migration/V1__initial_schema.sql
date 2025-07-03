CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,  -- hashed şifre
                       email VARCHAR(100) NOT NULL UNIQUE,
                       name VARCHAR(100),
                       surname VARCHAR(100),
                       password_reset_token VARCHAR(255),
                       reset_valid_until TIMESTAMP
);
