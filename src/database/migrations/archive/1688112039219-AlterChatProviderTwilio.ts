/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatProviderTwilio1688112039219 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat_provider_twilio rename column whatsapp_number to phone_number;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
