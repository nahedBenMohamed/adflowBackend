/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSiteFormField1719213418299 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table site_form_field alter column is_required drop not null;
      alter table site_form_field alter column is_required drop default;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
