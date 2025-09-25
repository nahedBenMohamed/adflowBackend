/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountSettings1678096716231 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table account_settings (
        account_id integer,
        language character varying not null,
        working_days character varying,
        working_time_from time,
        working_time_to time,
        time_zone character varying,
        currency character varying(3) not null,
        number_format character varying,
        primary key (account_id),
        foreign key (account_id) references account(id) on delete cascade
      );  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
