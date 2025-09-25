/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterGoogleCalendar1736239080782 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table google_calendar add column if not exists responsible_id integer not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
