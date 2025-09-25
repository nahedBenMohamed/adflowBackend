/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubtaskTable1674742927551 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table subtask
        (
            id         integer           not null,
            text       character varying not null,
            resolved   boolean           not null,
            task_id    integer           not null,
            account_id integer           not null,
            primary key (id),
            foreign key (task_id) references task (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence subtask_id_seq as integer minvalue 46022001;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
