/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterGoogleCalendar1736262949465 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table google_calendar add column if not exists channel_id text;
      alter table google_calendar add column if not exists channel_resource_id text;
      alter table google_calendar add column if not exists channel_expiration timestamp without time zone;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
