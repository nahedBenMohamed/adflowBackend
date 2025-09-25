/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAccountApiAccess1715856948928 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table account_api_access alter column created_at set default now();
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
