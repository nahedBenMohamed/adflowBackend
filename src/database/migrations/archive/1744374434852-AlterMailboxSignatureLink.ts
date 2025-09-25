/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMailboxSignatureLink1744374434852 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox_signature_link rename to mailbox_signature_mailbox;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
