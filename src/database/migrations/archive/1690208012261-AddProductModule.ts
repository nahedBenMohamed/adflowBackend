/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductModule1690208012261 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence if not exists product_module_id_seq as integer minvalue 1;

      create table product_module (
        id integer,
        name character varying not null,
        icon character varying not null,
        account_id integer not null,
        created_at timestamp without time zone not null default now(),
        primary key (id),
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
