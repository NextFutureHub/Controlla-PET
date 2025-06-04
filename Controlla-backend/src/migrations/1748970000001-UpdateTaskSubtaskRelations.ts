import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTaskSubtaskRelations1748970000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Создаем enum для статусов подзадач, если его еще нет
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subtask_status_enum') THEN
                    CREATE TYPE "subtask_status_enum" AS ENUM ('not-started', 'in-progress', 'blocked', 'completed');
                END IF;
            END$$;
        `);

        // Создаем таблицу подзадач, если ее еще нет
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "subtask" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text NOT NULL,
                "status" "subtask_status_enum" NOT NULL DEFAULT 'not-started',
                "progress" numeric(5,2) NOT NULL DEFAULT '0',
                "estimatedHours" numeric(10,2) NOT NULL,
                "loggedHours" numeric(10,2) NOT NULL DEFAULT '0',
                "dueDate" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "taskId" uuid,
                CONSTRAINT "PK_subtask" PRIMARY KEY ("id")
            )
        `);

        // Добавляем внешний ключ для связи с задачами
        await queryRunner.query(`
            ALTER TABLE "subtask"
            ADD CONSTRAINT "FK_subtask_task"
            FOREIGN KEY ("taskId")
            REFERENCES "task"("id")
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subtask" DROP CONSTRAINT "FK_subtask_task"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "subtask"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "subtask_status_enum"`);
    }
} 