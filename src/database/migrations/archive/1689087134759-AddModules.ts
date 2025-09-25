/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddModules1689087134759 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table module
        (
            id         integer,
            name       varchar(255) not null,
            code       varchar(100) not null,
            is_enabled boolean      not null,
            created_at timestamp without time zone not null,
            primary key (id)
        );
        create sequence module_id_seq as integer minvalue 1;

        insert into module (id, name, code, is_enabled, created_at)
        values (nextval('module_id_seq'), 'Products', 'products', true, now());

        create table account_module
        (
            account_id integer not null,
            module_id  integer not null,
            primary key (account_id, module_id),
            foreign key (account_id) references account (id) on delete cascade,
            foreign key (module_id) references module (id) on delete cascade
        );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
