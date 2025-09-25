/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatMessageScheduled1734600811704 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat_message_scheduled
        alter column entity_id drop not null,
        add column phone_number text;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
