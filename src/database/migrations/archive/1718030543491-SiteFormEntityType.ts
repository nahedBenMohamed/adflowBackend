/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SiteFormEntityType1718030543491 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop table site_form_link;

      create table site_form_entity_type (
        form_id integer,
        entity_type_id integer,
        account_id integer not null,
        board_id integer,
        primary key (form_id, entity_type_id),
        foreign key (form_id) references site_form(id) on delete cascade,
        foreign key (entity_type_id) references entity_type(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade,
        foreign key (board_id) references board(id) on delete set null
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
