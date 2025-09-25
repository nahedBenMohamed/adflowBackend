/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSiteFormField1718793757895 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table site_form_field
        add column is_validation_required boolean default false;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
