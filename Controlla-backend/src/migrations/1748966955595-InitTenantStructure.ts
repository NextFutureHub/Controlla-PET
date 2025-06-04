import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTenantStructure1748966955595 implements MigrationInterface {
    name = 'InitTenantStructure1748966955595'

    private async checkTableExists(queryRunner: QueryRunner, tableName: string): Promise<boolean> {
        const result = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            );
        `, [tableName]);
        return result[0].exists;
    }

    private async checkConstraintExists(queryRunner: QueryRunner, tableName: string, constraintName: string): Promise<boolean> {
        const result = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_schema = 'public' 
                AND table_name = $1 
                AND constraint_name = $2
            );
        `, [tableName, constraintName]);
        return result[0].exists;
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Проверяем существование типа перед созданием
        const enumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'users_role_enum'
            );
        `);
        
        if (!enumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')`);
        }

        // Проверяем и создаем таблицы
        if (!(await this.checkTableExists(queryRunner, 'users'))) {
            await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "isActive" boolean NOT NULL DEFAULT true, "lastLoginAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "tenantId" uuid, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        }

        if (!(await this.checkTableExists(queryRunner, 'contractors'))) {
            await queryRunner.query(`CREATE TABLE "contractors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "avatar" character varying, "email" character varying NOT NULL, "skills" text NOT NULL, "rating" numeric(3,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "tenantId" uuid, CONSTRAINT "UQ_328795c0f98ae88f6fcbc9f36d8" UNIQUE ("email"), CONSTRAINT "PK_6dbfde8813cdc4c4689f1e1e503" PRIMARY KEY ("id"))`);
        }

        // Проверяем существование типа перед созданием
        const subtaskStatusEnumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'subtask_status_enum'
            );
        `);
        
        if (!subtaskStatusEnumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "public"."subtask_status_enum" AS ENUM('not-started', 'in-progress', 'blocked', 'completed')`);
        }

        if (!(await this.checkTableExists(queryRunner, 'subtask'))) {
            await queryRunner.query(`CREATE TABLE "subtask" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "status" "public"."subtask_status_enum" NOT NULL DEFAULT 'not-started', "progress" numeric(5,2) NOT NULL DEFAULT '0', "estimatedHours" numeric(10,2) NOT NULL, "loggedHours" numeric(10,2) NOT NULL DEFAULT '0', "dueDate" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "taskId" uuid, CONSTRAINT "PK_e0cda44ad38dba885bd8ab1afd3" PRIMARY KEY ("id"))`);
        }

        // Проверяем существование типов перед созданием
        const taskStatusEnumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'task_status_enum'
            );
        `);
        
        if (!taskStatusEnumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "public"."task_status_enum" AS ENUM('not-started', 'in-progress', 'blocked', 'completed')`);
        }

        const taskPriorityEnumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'task_priority_enum'
            );
        `);
        
        if (!taskPriorityEnumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "public"."task_priority_enum" AS ENUM('low', 'medium', 'high')`);
        }

        if (!(await this.checkTableExists(queryRunner, 'task'))) {
            await queryRunner.query(`CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "status" "public"."task_status_enum" NOT NULL DEFAULT 'not-started', "priority" "public"."task_priority_enum" NOT NULL DEFAULT 'medium', "progress" numeric(5,2) NOT NULL DEFAULT '0', "estimatedHours" numeric(10,2) NOT NULL, "loggedHours" numeric(10,2) NOT NULL DEFAULT '0', "weight" numeric(5,2) NOT NULL DEFAULT '1', "dueDate" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "projectId" uuid, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        }

        // Проверяем существование типов перед созданием
        const projectsStatusEnumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'projects_status_enum'
            );
        `);
        
        if (!projectsStatusEnumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "public"."projects_status_enum" AS ENUM('active', 'completed', 'archived')`);
        }

        const projectsPriorityEnumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'projects_priority_enum'
            );
        `);
        
        if (!projectsPriorityEnumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "public"."projects_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`);
        }

        if (!(await this.checkTableExists(queryRunner, 'projects'))) {
            await queryRunner.query(`CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "status" "public"."projects_status_enum" NOT NULL DEFAULT 'active', "priority" "public"."projects_priority_enum" NOT NULL DEFAULT 'medium', "dueDate" TIMESTAMP NOT NULL, "progress" numeric(5,2) NOT NULL DEFAULT '0', "totalHours" numeric(10,2) NOT NULL DEFAULT '0', "budget" numeric(10,2) NOT NULL, "spent" numeric(10,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "managerId" uuid, "tenantId" uuid, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
        }

        if (!(await this.checkTableExists(queryRunner, 'tenants'))) {
            await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "industry" character varying, "website" character varying, "phone" character varying, "address" character varying, "logo" character varying, "isActive" boolean NOT NULL DEFAULT true, "settings" jsonb, "ownerId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        }

        // Создаем связующие таблицы
        if (!(await this.checkTableExists(queryRunner, 'contractor_projects'))) {
            await queryRunner.query(`CREATE TABLE "contractor_projects" ("contractor_id" uuid NOT NULL, "project_id" uuid NOT NULL, CONSTRAINT "PK_fe9d05a153023b90a85805f7e54" PRIMARY KEY ("contractor_id", "project_id"))`);
            await queryRunner.query(`CREATE INDEX "IDX_5ab05b50b6b63f5f7d7cde9f4e" ON "contractor_projects" ("contractor_id") `);
            await queryRunner.query(`CREATE INDEX "IDX_e04e53ddd19d2b0eff76b6a7bf" ON "contractor_projects" ("project_id") `);
        }

        if (!(await this.checkTableExists(queryRunner, 'projects_assigned_contractors_contractors'))) {
            await queryRunner.query(`CREATE TABLE "projects_assigned_contractors_contractors" ("projectsId" uuid NOT NULL, "contractorsId" uuid NOT NULL, CONSTRAINT "PK_44104a5188022f12698dcf27240" PRIMARY KEY ("projectsId", "contractorsId"))`);
            await queryRunner.query(`CREATE INDEX "IDX_4fb728ac293f349a8a6a319372" ON "projects_assigned_contractors_contractors" ("projectsId") `);
            await queryRunner.query(`CREATE INDEX "IDX_8ccd96c6b4c26f80706154c466" ON "projects_assigned_contractors_contractors" ("contractorsId") `);
        }

        // Добавляем внешние ключи
        if (!(await this.checkConstraintExists(queryRunner, 'users', 'FK_c58f7e88c286e5e3478960a998b'))) {
            await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }

        if (!(await this.checkConstraintExists(queryRunner, 'contractors', 'FK_c46cad4dce18ddf4a9d7f9f5891'))) {
            await queryRunner.query(`ALTER TABLE "contractors" ADD CONSTRAINT "FK_c46cad4dce18ddf4a9d7f9f5891" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }

        if (!(await this.checkConstraintExists(queryRunner, 'subtask', 'FK_8209040ec2c518c62c70cd382dd'))) {
            await queryRunner.query(`ALTER TABLE "subtask" ADD CONSTRAINT "FK_8209040ec2c518c62c70cd382dd" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }

        if (!(await this.checkConstraintExists(queryRunner, 'task', 'FK_3797a20ef5553ae87af126bc2fe'))) {
            await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }

        if (!(await this.checkConstraintExists(queryRunner, 'projects', 'FK_239dec66b26610938a98a7b7bd3'))) {
            await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_239dec66b26610938a98a7b7bd3" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }

        if (!(await this.checkConstraintExists(queryRunner, 'projects', 'FK_448b2462c0d35a96a820c926e0f'))) {
            await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_448b2462c0d35a96a820c926e0f" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }

        if (!(await this.checkConstraintExists(queryRunner, 'contractor_projects', 'FK_5ab05b50b6b63f5f7d7cde9f4eb'))) {
            await queryRunner.query(`ALTER TABLE "contractor_projects" ADD CONSTRAINT "FK_5ab05b50b6b63f5f7d7cde9f4eb" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        }

        if (!(await this.checkConstraintExists(queryRunner, 'contractor_projects', 'FK_e04e53ddd19d2b0eff76b6a7bf7'))) {
            await queryRunner.query(`ALTER TABLE "contractor_projects" ADD CONSTRAINT "FK_e04e53ddd19d2b0eff76b6a7bf7" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }

        if (!(await this.checkConstraintExists(queryRunner, 'projects_assigned_contractors_contractors', 'FK_4fb728ac293f349a8a6a3193729'))) {
            await queryRunner.query(`ALTER TABLE "projects_assigned_contractors_contractors" ADD CONSTRAINT "FK_4fb728ac293f349a8a6a3193729" FOREIGN KEY ("projectsId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        }

        if (!(await this.checkConstraintExists(queryRunner, 'projects_assigned_contractors_contractors', 'FK_8ccd96c6b4c26f80706154c466d'))) {
            await queryRunner.query(`ALTER TABLE "projects_assigned_contractors_contractors" ADD CONSTRAINT "FK_8ccd96c6b4c26f80706154c466d" FOREIGN KEY ("contractorsId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects_assigned_contractors_contractors" DROP CONSTRAINT "FK_8ccd96c6b4c26f80706154c466d"`);
        await queryRunner.query(`ALTER TABLE "projects_assigned_contractors_contractors" DROP CONSTRAINT "FK_4fb728ac293f349a8a6a3193729"`);
        await queryRunner.query(`ALTER TABLE "contractor_projects" DROP CONSTRAINT "FK_e04e53ddd19d2b0eff76b6a7bf7"`);
        await queryRunner.query(`ALTER TABLE "contractor_projects" DROP CONSTRAINT "FK_5ab05b50b6b63f5f7d7cde9f4eb"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_448b2462c0d35a96a820c926e0f"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_239dec66b26610938a98a7b7bd3"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe"`);
        await queryRunner.query(`ALTER TABLE "subtask" DROP CONSTRAINT "FK_8209040ec2c518c62c70cd382dd"`);
        await queryRunner.query(`ALTER TABLE "contractors" DROP CONSTRAINT "FK_c46cad4dce18ddf4a9d7f9f5891"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8ccd96c6b4c26f80706154c466"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4fb728ac293f349a8a6a319372"`);
        await queryRunner.query(`DROP TABLE "projects_assigned_contractors_contractors"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e04e53ddd19d2b0eff76b6a7bf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5ab05b50b6b63f5f7d7cde9f4e"`);
        await queryRunner.query(`DROP TABLE "contractor_projects"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TYPE "public"."projects_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TYPE "public"."task_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
        await queryRunner.query(`DROP TABLE "subtask"`);
        await queryRunner.query(`DROP TYPE "public"."subtask_status_enum"`);
        await queryRunner.query(`DROP TABLE "contractors"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }
}
