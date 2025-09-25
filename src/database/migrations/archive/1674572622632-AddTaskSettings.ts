/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskSettings1674572622632 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table task_settings
        (
            id            integer      not null,
            active_fields jsonb        not null,
            type          varchar(100) not null,
            record_id     integer,
            account_id    integer,
            primary key (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence task_settings_id_seq as integer minvalue 45022001;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
