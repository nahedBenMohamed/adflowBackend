/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSiteForm1718613418648 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table site_form
        add column field_label_enabled boolean not null default false,
        add column field_placeholder_enabled boolean not null default true;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
