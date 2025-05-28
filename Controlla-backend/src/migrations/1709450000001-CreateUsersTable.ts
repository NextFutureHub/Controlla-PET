import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1709450000001 implements MigrationInterface {
    name = 'CreateUsersTable1709450000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM (
                'super_admin',
                'tenant_admin',
                'project_manager',
                'contractor_company',
                'contractor_employee',
                'financial_manager',
                'client',
                'guest'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "role" "public"."user_role_enum" NOT NULL DEFAULT 'guest',
                "companyId" uuid,
                "contractorId" uuid,
                "isActive" boolean NOT NULL DEFAULT true,
                "lastLoginAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id"),
                CONSTRAINT "FK_users_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_users_contractor" FOREIGN KEY ("contractorId") REFERENCES "contractor"("id") ON DELETE SET NULL
            )
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX "IDX_users_email" ON "users" ("email");
            CREATE INDEX "IDX_users_role" ON "users" ("role");
            CREATE INDEX "IDX_users_company" ON "users" ("companyId");
            CREATE INDEX "IDX_users_contractor" ON "users" ("contractorId");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }
} 