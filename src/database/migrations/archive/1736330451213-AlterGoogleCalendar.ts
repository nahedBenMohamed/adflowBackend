/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterGoogleCalendar1736330451213 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table google_calendar add column if not exists next_sync_token text;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
