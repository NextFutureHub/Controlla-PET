import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class CreateSuperAdmin1748966955596 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await queryRunner.query(`
            INSERT INTO users (id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
            VALUES (
                uuid_generate_v4(),
                'admin@controlla.com',
                '${hashedPassword}',
                'Super',
                'Admin',
                'SUPER_ADMIN',
                true,
                NOW(),
                NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM users WHERE email = 'admin@controlla.com'
        `);
    }
} 