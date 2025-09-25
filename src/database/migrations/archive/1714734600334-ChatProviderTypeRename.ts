/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatProviderTypeRename1714734600334 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update chat_provider set type='twilio' where type='twilio_whatsapp';
      update chat_provider set type='facebook' where type='facebook_messenger';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
