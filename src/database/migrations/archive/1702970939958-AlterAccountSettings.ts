/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAccountSettings1702970939958 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table account_settings add column phone_format character varying not null default 'international';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
