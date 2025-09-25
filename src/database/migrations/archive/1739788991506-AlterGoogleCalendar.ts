/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterGoogleCalendar1739788991506 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table google_calendar
        alter column object_id set data type integer using object_id::integer;
      
      update google_calendar set object_id = object_id::integer;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
