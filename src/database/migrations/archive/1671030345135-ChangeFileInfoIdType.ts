/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeFileInfoIdType1671030345135 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from file_info;
      drop table file_info;
      
      drop sequence file_info_seq;
      
      create table file_info (
        id uuid default gen_random_uuid(),
        account_id integer not null,
        created_at timestamp without time zone not null,
        created_by integer not null,
        key character varying not null,
        original_name character varying not null,
        mime_type character varying not null,
        size integer not null,
        hash_md5 character varying not null,
        store_path character varying not null,
        primary key (id),
        foreign key (account_id) references account(id),
        foreign key (created_by) references users(id)
      );    
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
