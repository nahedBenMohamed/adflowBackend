/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskCommentTable1674822646459 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table task_comment
        (
            id         integer,
            text       character varying not null,
            task_id    integer           not null,
            created_by integer           not null,
            account_id integer           not null,
            created_at timestamp without time zone not null,
            primary key (id),
            foreign key (task_id) references task (id) on delete cascade,
            foreign key (created_by) references users (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence task_comment_id_seq as integer minvalue 47022001;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
