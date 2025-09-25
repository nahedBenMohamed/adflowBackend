/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AccountApiAccessIndex1722251334680 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_account_api_access_api_key ON account_api_access(api_key);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
