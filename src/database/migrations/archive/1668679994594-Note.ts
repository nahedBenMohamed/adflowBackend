/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Note1668679994594 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table note (
        id          bigint,
        created_at  timestamp without time zone not null,
        text        character varying           not null,
        entity_id   bigint                      not null,
        created_by  integer                     not null,
        account_id  integer                     not null,
        primary key (id),
        foreign key (created_by) references users(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
      create sequence note_id_seq as bigint minvalue 22022001;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
