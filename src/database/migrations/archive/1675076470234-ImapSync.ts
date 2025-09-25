/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ImapSync1675076470234 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox_settings_manual drop column last_sync;
      alter table mailbox_settings_manual add column imap_sync jsonb;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
