/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AccountApiAccess1715856544173 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table account_api_access (
        account_id integer,
        api_key character varying not null,
        created_at timestamp without time zone not null,
        primary key (account_id),
        foreign key (account_id) references account(id) on delete cascade
      );  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
