/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastSyncToManualSettings1674546589359 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox_settings_manual
        add column last_sync timestamp without time zone;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
