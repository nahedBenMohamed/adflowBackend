/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMailboxFolder1745220421131 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox_folder add column if not exists uid_validity integer;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
