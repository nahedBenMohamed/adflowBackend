/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MailboxLatsActiveAt1725622826309 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox add column last_active_at timestamp without time zone;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
