/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDepartment1678891987277 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence if not exists department_id_seq as integer minvalue 1;

      create table department (
        id integer,
        name character varying not null,
        parent_id integer,
        account_id integer not null,
        primary key (id),
        foreign key (account_id) references account(id) on delete cascade
      );

      alter table department
        add foreign key (parent_id) references department(id) on delete cascade;

      alter table users
        add column department_id integer,
        add foreign key (department_id) references department(id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
