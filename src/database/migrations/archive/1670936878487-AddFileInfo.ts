/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileInfo1670936878487 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence if not exists file_info_seq as integer minvalue 0;

      create table file_info (
        id integer default nextval('file_info_seq'::regclass),
        account_id integer not null,
        created_at timestamp without time zone not null,
        created_by integer not null,
        key character varying not null,
        original_name character varying not null,
        mime_type character varying not null,
        size integer not null,
        primary key (id),
        foreign key (account_id) references account(id),
        foreign key (created_by) references users(id)
      );  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
