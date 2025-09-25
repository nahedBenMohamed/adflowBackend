/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MailboxFolderTypeNullable1675178566416 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox_folder alter column type drop not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
