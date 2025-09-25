/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class GoogleCalendarIndexes1736331095918 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index if not exists idx_channel_resource on google_calendar(channel_id, channel_resource_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
