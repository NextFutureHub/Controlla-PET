import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTenantCascade1752128089910 implements MigrationInterface {
    name = 'UpdateUserTenantCascade1752128089910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contractor_projects" DROP CONSTRAINT "FK_e04e53ddd19d2b0eff76b6a7bf7"`);
        await queryRunner.query(`ALTER TABLE "contractor_projects" DROP CONSTRAINT "FK_5ab05b50b6b63f5f7d7cde9f4eb"`);
        await queryRunner.query(`ALTER TABLE "contractor_projects" ADD CONSTRAINT "FK_e04e53ddd19d2b0eff76b6a7bf7" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "contractor_projects" ADD CONSTRAINT "FK_5ab05b50b6b63f5f7d7cde9f4eb" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contractor_projects" DROP CONSTRAINT "FK_5ab05b50b6b63f5f7d7cde9f4eb"`);
        await queryRunner.query(`ALTER TABLE "contractor_projects" DROP CONSTRAINT "FK_e04e53ddd19d2b0eff76b6a7bf7"`);
        await queryRunner.query(`ALTER TABLE "contractor_projects" ADD CONSTRAINT "FK_5ab05b50b6b63f5f7d7cde9f4eb" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contractor_projects" ADD CONSTRAINT "FK_e04e53ddd19d2b0eff76b6a7bf7" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
