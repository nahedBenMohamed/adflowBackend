/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntityListSettings1681289039535 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table entity_list_settings (
        id integer,
        entity_type_id integer not null,
        board_id integer,
        settings jsonb not null,
        account_id integer not null,
        created_at timestamp without time zone not null,
        primary key (id),
        foreign key (entity_type_id) references entity_type(id) on delete cascade,
        foreign key (board_id) references board(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );

      create sequence if not exists entity_list_settings_id_seq as integer minvalue 1;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
