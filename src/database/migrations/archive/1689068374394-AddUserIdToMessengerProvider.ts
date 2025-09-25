/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToMessengerProvider1689068374394 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat_provider_messenger add column user_id character varying not null;
      alter table chat_provider_messenger add column user_access_token character varying not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
