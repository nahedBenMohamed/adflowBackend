/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSiteForm1720076313493 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table site_form
        add column created_by integer,
        add foreign key (created_by) references users(id);

      update site_form set created_by = responsible_id;

      alter table site_form alter column created_by set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
