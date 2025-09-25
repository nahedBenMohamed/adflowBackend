/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MailMessageThreadIdNotNull1675939938059 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mail_message
        alter column thread_id set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
