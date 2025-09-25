/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeMailbox1674637903317 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox
        add column sync_days smallint,
        drop column type
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
