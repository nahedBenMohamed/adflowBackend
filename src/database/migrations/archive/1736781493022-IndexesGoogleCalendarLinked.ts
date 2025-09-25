/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class IndexesGoogleCalendarLinked1736781493022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index if not exists idx_calendar on google_calendar_linked(calendar_id);
      create index if not exists idx_type_object on google_calendar_linked(type, object_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
