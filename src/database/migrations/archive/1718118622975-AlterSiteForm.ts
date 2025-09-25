/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSiteForm1718118622975 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table site_form
        drop column type,
        drop column color_main,
        drop column color_background,
        drop column color_font,
        alter column title set default null,
        add column responsible_id integer default null,
        add column design jsonb default null,
        add foreign key (responsible_id) references users(id) on delete set null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
