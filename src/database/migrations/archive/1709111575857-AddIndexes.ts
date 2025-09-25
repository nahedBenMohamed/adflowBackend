/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1709111575857 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index entity_type_link_account_id_source_id_sort_order_id_idx on entity_type_link(account_id, source_id, sort_order, id);
      create index users_account_id_id_idx on users(account_id, id);
      create index field_group_account_id_entity_type_id_idx on field_group(account_id, entity_type_id);

      create index idx_chat_on_account_id on chat(account_id);
      create index idx_cmus_on_message_id_status on chat_message_user_status(message_id, status);
      create index idx_cmus_on_message_id_chat_id_status on chat_message_user_status(message_id, chat_id, status);
      create index idx_chat_user_on_user_id on chat_user(user_id);
      create index idx_chat_user_on_user_id_chat_id on chat_user(user_id, chat_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
