-- Проверяем существование пользователя
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@controlla.com') THEN
        INSERT INTO users (
            id,
            email,
            password,
            "firstName",
            "lastName",
            role,
            "isActive",
            "createdAt",
            "updatedAt"
        ) VALUES (
            uuid_generate_v4(),
            'admin@controlla.com',
            '$2b$10$3euPcmQFCiblsZeEu5s7p.9BUe7QZxVxXxXxXxXxXxXxXxXxXxXxXxXx', -- хеш пароля 'admin123'
            'Super',
            'Admin',
            'SUPER_ADMIN',
            true,
            NOW(),
            NOW()
        );
    END IF;
END $$; 