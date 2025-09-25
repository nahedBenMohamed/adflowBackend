/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatProviderEntitySettings1743065071601 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat_provider_entity_settings add column lead_name text;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
