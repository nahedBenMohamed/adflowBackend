/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskType1668770161278 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table task_type (
        id          integer,
        created_at  timestamp without time zone not null,
        account_id  integer                     not null,
        name        character varying(128)      not null,
        primary key (id),
        foreign key (account_id) references account(id) on delete cascade
      );

      create sequence task_type_id_seq as bigint minvalue 25022001;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
