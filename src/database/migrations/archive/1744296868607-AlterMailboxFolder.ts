/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMailboxFolder1744296868607 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox_folder rename column messages_total to total;
      alter table mailbox_folder rename column messages_unread to unread;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
