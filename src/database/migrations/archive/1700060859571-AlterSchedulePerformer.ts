/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSchedulePerformer1700060859571 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table schedule_performer
        alter column user_id drop not null,
        add column department_id integer,
        add column type character varying not null default 'user',
        add foreign key (department_id) references department(id) on delete cascade;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
