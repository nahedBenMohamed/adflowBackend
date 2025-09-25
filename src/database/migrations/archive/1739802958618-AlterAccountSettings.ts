/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAccountSettings1739802958618 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table account_settings add column start_of_week text default 'Monday';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
