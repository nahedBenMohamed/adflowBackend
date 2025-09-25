/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatProviderMessagePerDay1725269507813 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat_provider add column message_per_day integer;
      update chat_provider set message_per_day = 10 where message_per_day is null;
      alter table chat_provider alter column message_per_day set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
