/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatMessageReaction1686824143539 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence if not exists chat_message_reaction_id_seq as integer minvalue 1;

      create table chat_message_reaction (
        id integer,
        message_id integer not null,
        chat_user_id integer not null,
        reaction character varying not null,
        account_id integer not null,
        created_at timestamp without time zone not null,
        primary key (id),
        foreign key (message_id) references chat_message(id) on delete cascade,
        foreign key (chat_user_id) references chat_user(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
