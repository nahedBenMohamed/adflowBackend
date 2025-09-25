/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMailMessageScheduled1723386042005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mail_message_scheduled rename column created_by to send_from;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
