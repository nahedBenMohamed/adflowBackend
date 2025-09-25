/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatPinnedMessage1686816157824 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table chat_pinned_message (
        chat_id integer,
        message_id integer,
        created_at timestamp without time zone not null,
        account_id integer not null,
        primary key (chat_id, message_id),
        foreign key (chat_id) references chat(id) on delete cascade,
        foreign key (message_id) references chat_message(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );

      alter table chat drop column pinned_message_id;
    
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
