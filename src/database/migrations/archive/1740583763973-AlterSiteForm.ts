/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSiteForm1740583763973 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table site_form add column deduplicate_linked boolean not null default false;
      alter table site_form add column schedule_limit_days integer;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
