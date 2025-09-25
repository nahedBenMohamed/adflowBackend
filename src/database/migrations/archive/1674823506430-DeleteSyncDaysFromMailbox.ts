/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteSyncDaysFromMailbox1674823506430 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox
        drop column sync_days;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
