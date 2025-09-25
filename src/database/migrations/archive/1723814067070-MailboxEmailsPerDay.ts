/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MailboxEmailsPerDay1723814067070 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update mailbox set emails_per_day = 100 where emails_per_day is null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
