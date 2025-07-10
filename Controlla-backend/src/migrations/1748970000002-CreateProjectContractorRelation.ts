import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectContractorRelation1748970000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Создаем таблицу связи между проектами и подрядчиками
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "contractor_projects" (
                "contractor_id" uuid NOT NULL,
                "project_id" uuid NOT NULL,
                CONSTRAINT "PK_contractor_projects" PRIMARY KEY ("contractor_id", "project_id")
            )
        `);

        // Добавляем внешние ключи
        await queryRunner.query(`
            ALTER TABLE "contractor_projects"
            ADD CONSTRAINT "FK_contractor_projects_contractor"
            FOREIGN KEY ("contractor_id")
            REFERENCES "contractors"("id")
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "contractor_projects"
            ADD CONSTRAINT "FK_contractor_projects_project"
            FOREIGN KEY ("project_id")
            REFERENCES "projects"("id")
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contractor_projects" DROP CONSTRAINT "FK_contractor_projects_project"`);
        await queryRunner.query(`ALTER TABLE "contractor_projects" DROP CONSTRAINT "FK_contractor_projects_contractor"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "contractor_projects"`);
    }
} 