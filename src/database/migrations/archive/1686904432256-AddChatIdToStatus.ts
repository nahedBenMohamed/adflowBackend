/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatIdToStatus1686904432256 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop table chat_message_user_status;

      create table chat_message_user_status (
        chat_id integer not null,
        message_id integer not null,
        chat_user_id integer not null,
        status character varying not null,
        account_id integer not null,
        created_at timestamp without time zone not null,
        foreign key (chat_id) references chat(id) on delete cascade,
        foreign key (message_id) references chat_message(id) on delete cascade,
        foreign key (chat_user_id) references chat_user(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade,
        primary key (chat_id, message_id, chat_user_id)
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
