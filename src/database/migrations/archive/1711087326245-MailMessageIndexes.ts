/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MailMessageIndexes1711087326245 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_mail_message_account_mailbox ON mail_message(account_id, mailbox_id);
      CREATE INDEX idx_mail_message_external_id ON mail_message(external_id);
      CREATE INDEX idx_mail_message_message_id ON mail_message(message_id);
      CREATE INDEX idx_mailbox_folder_account_mailbox ON mailbox_folder(account_id, mailbox_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
