import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueIndexToTenantName1710000000000 implements MigrationInterface {
    name = 'AddUniqueIndexToTenantName1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Сначала удаляем дубликаты, оставляя только первый найденный
        await queryRunner.query(`
            DELETE FROM tenants a
            USING tenants b
            WHERE a.id > b.id
            AND a.name = b.name
        `);

        // Добавляем уникальный индекс
        await queryRunner.query(`
            ALTER TABLE tenants
            ADD CONSTRAINT UQ_tenants_name UNIQUE (name)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE tenants
            DROP CONSTRAINT UQ_tenants_name
        `);
    }
} 