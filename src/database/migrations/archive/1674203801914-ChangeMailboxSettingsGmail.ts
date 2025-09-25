/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeMailboxSettingsGmail1674203801914 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox_settings_gmail
        drop column access_token,
        drop column refresh_token,
        add column tokens jsonb not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
