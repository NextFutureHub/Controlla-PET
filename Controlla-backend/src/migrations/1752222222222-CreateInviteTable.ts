import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInviteTable1752222222222 implements MigrationInterface {
    name = 'CreateInviteTable1752222222222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "invites" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" character varying(12) NOT NULL,
                "role" character varying,
                "isUsed" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "expiresAt" TIMESTAMP,
                "tenantId" uuid NOT NULL,
                "usedById" uuid,
                CONSTRAINT "UQ_invite_code" UNIQUE ("code"),
                CONSTRAINT "PK_invite_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_invite_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_invite_usedBy" FOREIGN KEY ("usedById") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "invites"`);
    }
} 