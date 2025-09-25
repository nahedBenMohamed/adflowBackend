/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAccountSettings1732521216471 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table account_settings add column is_bpmn_enable boolean not null default false;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
