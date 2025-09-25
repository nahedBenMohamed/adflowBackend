/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatProviderUser1688130606571 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create type chat_provider_user_type as enum ('accessible', 'responsible');
      alter table chat_provider_user
        add column type chat_provider_user_type not null default 'accessible',
        alter column account_id set not null;

      alter table chat_provider_user
        drop constraint chat_provider_user_pkey;

      alter table chat_provider_user
        add constraint chat_provider_user_pkey primary key (provider_id, user_id, type);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
