/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MailFolderOptimization1727265648107 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS mailbox_folder_account_id_mailbox_id_idx;

      CREATE INDEX idx_mailbox_folder_mailbox_id ON mailbox_folder(mailbox_id);
      CREATE INDEX idx_mail_message_folder_folder_id ON mail_message_folder(folder_id);
      CREATE INDEX idx_mail_message_id_is_seen ON mail_message(id, is_seen);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
