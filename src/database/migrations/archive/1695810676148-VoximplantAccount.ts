/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VoximplantAccount1695810676148 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table voximplant_account (
        account_id integer,
        account_name character varying not null,
        application_id integer not null,
        application_name character varying not null,
        primary key (account_id),
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
