/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ScheduledMailMessageIndex1709110989045 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index scheduled_mail_message_mailbox_id_sent_at_null_idx
      on scheduled_mail_message(mailbox_id)
      where sent_at is null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
