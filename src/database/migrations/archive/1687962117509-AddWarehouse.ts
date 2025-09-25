/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWarehouse1687962117509 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table warehouse
        (
            id         integer,
            name       character varying,
            created_by integer not null,
            account_id integer not null,
            created_at timestamp without time zone not null,
            primary key (id),
            foreign key (created_by) references users (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence warehouse_id_seq as integer minvalue 1;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
