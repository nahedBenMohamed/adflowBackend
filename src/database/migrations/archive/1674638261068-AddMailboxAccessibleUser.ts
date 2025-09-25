/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMailboxAccessibleUser1674638261068 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    create table mailbox_accessible_user (
      mailbox_id integer,
      user_id integer,
      account_id integer,
      foreign key (mailbox_id) references mailbox(id) on delete cascade,
      foreign key (user_id) references users(id) on delete cascade,
      foreign key (account_id) references account(id) on delete cascade,
      primary key (mailbox_id, user_id)
    );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
