/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SiteFormConsent1718098642901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table site_form_consent (
        form_id integer,
        account_id integer,
        is_enabled boolean not null default false,
        text text,
        link_url text,
        link_text text,
        default_value boolean not null default false,
        primary key (form_id),
        foreign key (form_id) references site_form(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
