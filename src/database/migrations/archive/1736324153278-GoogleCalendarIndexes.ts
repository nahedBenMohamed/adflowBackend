/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class GoogleCalendarIndexes1736324153278 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index if not exists idx_channel_expiration on google_calendar(channel_expiration);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
