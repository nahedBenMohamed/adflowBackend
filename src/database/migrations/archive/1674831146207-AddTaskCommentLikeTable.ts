/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskCommentLikeTable1674831146207 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table task_comment_like
        (
            comment_id integer,
            user_id    integer,
            account_id integer,
            foreign key (comment_id) references task_comment (id) on delete cascade,
            foreign key (user_id) references users (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade,
            primary key (comment_id, user_id)
        );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
