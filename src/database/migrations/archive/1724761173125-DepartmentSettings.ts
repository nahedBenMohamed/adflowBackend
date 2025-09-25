/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DepartmentSettings1724761173125 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table department_settings (
        department_id integer not null,
        account_id integer not null,
        working_days text,
        working_time_from time without time zone,
        working_time_to time without time zone,
        time_zone text,
        primary key (department_id),
        foreign key (department_id) references department(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
