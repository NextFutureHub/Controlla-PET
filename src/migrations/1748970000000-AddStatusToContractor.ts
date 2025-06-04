import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToContractor1748970000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contractor_status_enum') THEN
                    CREATE TYPE "contractor_status_enum" AS ENUM ('active', 'inactive', 'offline');
                END IF;
            END$$;
        `);
        await queryRunner.query(`
            ALTER TABLE "contractors"
            ADD COLUMN "status" "contractor_status_enum" NOT NULL DEFAULT 'active'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "contractors" DROP COLUMN "status"
        `);
        await queryRunner.query(`
            DROP TYPE IF EXISTS "contractor_status_enum"
        `);
    }
} 