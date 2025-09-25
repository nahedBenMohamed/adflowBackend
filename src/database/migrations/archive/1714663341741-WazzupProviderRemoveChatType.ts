/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class WazzupProviderRemoveChatType1714663341741 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat_provider_wazzup drop column chat_type;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
