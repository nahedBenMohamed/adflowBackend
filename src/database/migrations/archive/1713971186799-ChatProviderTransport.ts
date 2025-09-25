/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatProviderTransport1713971186799 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat_provider add column transport character varying;
      update chat_provider set transport = 'amwork' where type = 'amwork';
      update chat_provider set transport = 'whatsapp' where type = 'twilio_whatsapp';
      update chat_provider set transport = 'messenger' where type = 'facebook_messenger';
      alter table chat_provider alter column transport set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
