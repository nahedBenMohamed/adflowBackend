/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMailboxFolderInfo1674648741806 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox_folder
        add column messages_total integer,
        add column messages_unread integer;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
