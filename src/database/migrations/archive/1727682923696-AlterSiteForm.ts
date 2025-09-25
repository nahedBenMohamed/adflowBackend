/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSiteForm1727682923696 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table site_form add column multiform_enabled boolean not null default false;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
