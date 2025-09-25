/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenToSalesforce1672224404851 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table salesforce_settings add column refresh_token character varying;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
